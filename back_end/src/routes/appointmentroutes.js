import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
import { createNotification } from "../notificationService.js";

const router = Router();


const appointmentProposalsSelect = `
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id_proposition', p.id_proposition,
          'date_proposition', TO_CHAR(p.date_heure, 'YYYY-MM-DD'),
          'heure_proposition', TO_CHAR(p.date_heure, 'HH24:MI'),
          'statut', p.statut,
          'created_at', p.created_at
        )
        ORDER BY p.date_heure ASC
      )
      FROM rendez_vous_propositions p
      WHERE p.id_rdv = r.id_rdv
    ),
    '[]'::json
  ) AS propositions
`;

function normalizeProposalSlots(slots = []) {
  return slots
    .slice(0, 3)
    .map((slot) => {
      const date = slot.date?.trim();
      const time = slot.time?.trim();
      if (!date || !time) return null;
      return `${date} ${time}:00`;
    })
    .filter(Boolean);
}

/* ======================================================
   PATIENT → DEMANDE DE RENDEZ-VOUS
   POST /api/appointments
   ====================================================== */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { partenaireId, date, time, mode, message } = req.body;
    const id_patient = req.user.id_utilisateur;

    const dateHeure = `${date} ${time}:00`;
    const duree = 30;

    const expertResult = await pool.query(
      `SELECT us.id_service
       FROM user_services us
       WHERE us.id_utilisateur = $1
       LIMIT 1`,
      [partenaireId]
    );
    const expert = expertResult.rows[0];

    if (!expert?.id_service) {
      return res.status(400).json({
        error: "Impossible de déterminer le service du patient expert",
      });
    }

    await pool.query(
      `INSERT INTO rendez_vous
       (id_patient, id_expert, id_service, date_heure, duree_min, mode, note_interne)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_rdv`,
      [
        id_patient,
        partenaireId,
        expert.id_service,
        dateHeure,
        duree,
        mode,
        message || null,
      ]
    );

    await createNotification(pool, {
      userId: partenaireId,
      type: "appointment_requested",
      title: "Nouvelle demande de rendez-vous",
      message: "Un patient vous a envoyé une nouvelle demande de rendez-vous.",
      link: "/expert/dashboard",
    });

    res.status(201).json({
      message: "Demande de rendez-vous envoyée",
      statut: "demande",
    });
  } catch (err) {
    console.error("APPOINTMENT CREATE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ======================================================
   PATIENT → VOIR SES RDV
   GET /api/appointments/my
   GET /api/appointments/patient
   ====================================================== */
router.get(["/my", "/patient"], requireAuth, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const result = await pool.query(
    `SELECT
       r.*,
       SPLIT_PART(u.nom_complet, ' ', 1) AS expert_prenom,
       CASE
         WHEN POSITION(' ' IN u.nom_complet) > 0
         THEN SUBSTRING(u.nom_complet FROM POSITION(' ' IN u.nom_complet) + 1)
         ELSE ''
       END AS expert_nom,
       TO_CHAR(r.date_heure, 'YYYY-MM-DD') AS date_rdv,
       TO_CHAR(r.date_heure, 'HH24:MI') AS heure_rdv,
       ${appointmentProposalsSelect}
     FROM rendez_vous r
     JOIN utilisateurs u ON r.id_expert = u.id_utilisateur
     WHERE r.id_patient = $1
     ORDER BY r.date_heure DESC`,
    [req.user.id_utilisateur]
  );

  res.json(result.rows);
});

/* ======================================================
   EXPERT → VOIR LES DEMANDES
   GET /api/appointments/expert
   ====================================================== */
router.get("/expert", requireAuth, async (req, res) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const result = await pool.query(
    `SELECT
       r.*,
       u.nom_complet AS patient_nom,
       TO_CHAR(r.date_heure, 'YYYY-MM-DD') AS date_rdv,
       TO_CHAR(r.date_heure, 'HH24:MI') AS heure_rdv,
       ${appointmentProposalsSelect}
     FROM rendez_vous r
     JOIN utilisateurs u ON r.id_patient = u.id_utilisateur
     WHERE r.id_expert = $1
     ORDER BY r.date_heure DESC`,
    [req.user.id_utilisateur]
  );

  res.json(result.rows);
});


/* ======================================================
   EXPERT → PROPOSER PLUSIEURS CRÉNEAUX
   POST /api/appointments/:id/proposals
   ====================================================== */
router.post("/:id/proposals", requireAuth, async (req, res) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const client = await pool.connect();

  try {
    const slots = normalizeProposalSlots(req.body.proposals);

    if (slots.length === 0 || slots.length > 3) {
      return res.status(400).json({ error: "Veuillez proposer entre 1 et 3 créneaux" });
    }

    await client.query("BEGIN");

    const appointmentResult = await client.query(
      `SELECT id_rdv, id_expert, id_patient, statut
       FROM rendez_vous
       WHERE id_rdv = $1 AND id_expert = $2
       FOR UPDATE`,
      [req.params.id, req.user.id_utilisateur]
    );

    const appointment = appointmentResult.rows[0];

    if (!appointment) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Rendez-vous introuvable" });
    }

    if (appointment.statut !== "demande") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Vous pouvez proposer des créneaux uniquement sur une demande en attente" });
    }

    await client.query(
      `UPDATE rendez_vous_propositions
       SET statut = 'refusee'
       WHERE id_rdv = $1 AND statut = 'en_attente'`,
      [req.params.id]
    );

    const inserted = [];

    for (const slot of slots) {
      const result = await client.query(
        `INSERT INTO rendez_vous_propositions (id_rdv, id_expert, date_heure)
         VALUES ($1, $2, $3)
         RETURNING id_proposition, TO_CHAR(date_heure, 'YYYY-MM-DD') AS date_proposition,
                   TO_CHAR(date_heure, 'HH24:MI') AS heure_proposition, statut, created_at`,
        [req.params.id, req.user.id_utilisateur, slot]
      );
      inserted.push(result.rows[0]);
    }

    await createNotification(client, {
      userId: appointment.id_patient,
      type: "appointment_slots_proposed",
      title: "Nouveaux créneaux proposés",
      message: "Votre patient partenaire vous propose de nouveaux créneaux pour votre rendez-vous.",
      link: "/patient/dashboard",
    });

    await client.query("COMMIT");

    res.status(201).json({ message: "Créneaux proposés", propositions: inserted });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("APPOINTMENT PROPOSALS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ======================================================
   PATIENT → ACCEPTER UN CRÉNEAU PROPOSÉ
   POST /api/appointments/proposals/:proposalId/accept
   ====================================================== */
router.post("/proposals/:proposalId/accept", requireAuth, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const proposalResult = await client.query(
      `SELECT p.id_proposition, p.id_rdv, p.date_heure, p.statut AS proposition_statut,
              r.id_patient, r.id_expert, r.statut AS rdv_statut
       FROM rendez_vous_propositions p
       JOIN rendez_vous r ON r.id_rdv = p.id_rdv
       WHERE p.id_proposition = $1 AND r.id_patient = $2
       FOR UPDATE`,
      [req.params.proposalId, req.user.id_utilisateur]
    );

    const proposal = proposalResult.rows[0];

    if (!proposal) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Proposition introuvable" });
    }

    if (proposal.rdv_statut !== "demande" || proposal.proposition_statut !== "en_attente") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Cette proposition n'est plus disponible" });
    }

    await client.query(
      `UPDATE rendez_vous
       SET date_heure = $1, statut = 'confirme'
       WHERE id_rdv = $2 AND id_patient = $3`,
      [proposal.date_heure, proposal.id_rdv, req.user.id_utilisateur]
    );

    await client.query(
      `UPDATE rendez_vous_propositions
       SET statut = CASE WHEN id_proposition = $1 THEN 'acceptee' ELSE 'refusee' END
       WHERE id_rdv = $2 AND statut = 'en_attente'`,
      [proposal.id_proposition, proposal.id_rdv]
    );

    await createNotification(client, {
      userId: proposal.id_expert,
      type: "appointment_slot_accepted",
      title: "Créneau accepté",
      message: "Un patient a accepté l’un des créneaux que vous avez proposés.",
      link: "/expert/dashboard",
    });

    await client.query("COMMIT");

    res.json({ message: "Créneau accepté" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ACCEPT PROPOSAL ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ======================================================
   EXPERT → ACCEPTER RDV
   POST /api/appointments/:id/accept
   ====================================================== */
router.post("/:id/accept", requireAuth, async (req, res) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const result = await pool.query(
    `UPDATE rendez_vous
     SET statut = 'confirme'
     WHERE id_rdv = $1 AND id_expert = $2
     RETURNING id_patient`,
    [req.params.id, req.user.id_utilisateur]
  );

  await pool.query(
    `UPDATE rendez_vous_propositions
     SET statut = 'refusee'
     WHERE id_rdv = $1 AND statut = 'en_attente'`,
    [req.params.id]
  );

  if (result.rows[0]?.id_patient) {
    await createNotification(pool, {
      userId: result.rows[0].id_patient,
      type: "appointment_accepted",
      title: "Rendez-vous accepté",
      message: "Votre demande de rendez-vous a été acceptée.",
      link: "/patient/dashboard",
    });
  }

  res.json({ message: "Rendez-vous accepté" });
});

/* ======================================================
   EXPERT → REFUSER RDV
   POST /api/appointments/:id/refuse
   ====================================================== */
router.post("/:id/refuse", requireAuth, async (req, res) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const result = await pool.query(
    `UPDATE rendez_vous
     SET statut = 'refuse'
     WHERE id_rdv = $1 AND id_expert = $2
     RETURNING id_patient`,
    [req.params.id, req.user.id_utilisateur]
  );

  await pool.query(
    `UPDATE rendez_vous_propositions
     SET statut = 'refusee'
     WHERE id_rdv = $1 AND statut = 'en_attente'`,
    [req.params.id]
  );

  if (result.rows[0]?.id_patient) {
    await createNotification(pool, {
      userId: result.rows[0].id_patient,
      type: "appointment_refused",
      title: "Rendez-vous refusé",
      message: "Votre demande de rendez-vous a été refusée.",
      link: "/patient/dashboard",
    });
  }

  res.json({ message: "Rendez-vous refusé" });
});

/* ======================================================
   EXPERT → MARQUER UN RDV COMME TERMINÉ
   POST /api/appointments/:id/complete
   ====================================================== */
router.post("/:id/complete", requireAuth, async (req, res) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  await pool.query(
    `UPDATE rendez_vous
     SET statut = 'termine'
     WHERE id_rdv = $1 AND id_expert = $2`,
    [req.params.id, req.user.id_utilisateur]
  );

  res.json({ message: "Rendez-vous terminé" });
});

/* ======================================================
   PATIENT → ANNULER UN RDV
   POST /api/appointments/:id/cancel
   ====================================================== */
router.post("/:id/cancel", requireAuth, async (req, res) => {
  if (req.user.role !== "patient") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const result = await pool.query(
    `UPDATE rendez_vous
     SET statut = 'annule'
     WHERE id_rdv = $1 AND id_patient = $2
       AND statut IN ('demande', 'confirme')
     RETURNING id_expert`,
    [req.params.id, req.user.id_utilisateur]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Rendez-vous introuvable ou non annulable" });
  }

  await pool.query(
    `UPDATE rendez_vous_propositions
     SET statut = 'refusee'
     WHERE id_rdv = $1 AND statut = 'en_attente'`,
    [req.params.id]
  );

  if (result.rows[0]?.id_expert) {
    await createNotification(pool, {
      userId: result.rows[0].id_expert,
      type: "appointment_cancelled",
      title: "Rendez-vous annulé",
      message: "Un patient a annulé un rendez-vous.",
      link: "/expert/dashboard",
    });
  }

  res.json({ message: "Rendez-vous annulé" });
});

export default router;
