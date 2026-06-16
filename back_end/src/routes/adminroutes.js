import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/* 
   ADMIN → LISTER LES EXPERTS EN ATTENTE
   GET /api/admin/experts/pending
*/
router.get("/experts/pending", requireAuth, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (req.user.role !== "admin_global" && req.user.role !== "admin_service") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const result = await pool.query(
      `SELECT 
        u.id_utilisateur,
        u.nom_complet,
        u.email,
        u.telephone,
        u.date_creation,
        s.nom_service AS service
      FROM utilisateurs u
      LEFT JOIN user_services us ON us.id_utilisateur = u.id_utilisateur
      LEFT JOIN services s ON s.id_service = us.id_service
      WHERE u.role_global = 'expert'
        AND u.statut = 'pending'
      ORDER BY u.date_creation DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET PENDING EXPERTS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* 
   ADMIN → VALIDER UN EXPERT
   POST /api/admin/experts/:id/approve
*/
router.post("/experts/:id/approve", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin_global" && req.user.role !== "admin_service") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const expertId = req.params.id;

    // Mettre à jour le statut
    const result = await pool.query(
      `UPDATE utilisateurs
       SET statut = 'actif'
       WHERE id_utilisateur = $1 AND role_global = 'expert'
       RETURNING id_utilisateur`,
      [expertId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expert introuvable" });
    }

    res.json({ message: "Expert validé avec succès" });
  } catch (err) {
    console.error("APPROVE EXPERT ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* 
   ADMIN → REFUSER UN EXPERT
   POST /api/admin/experts/:id/reject
*/
router.post("/experts/:id/reject", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin_global" && req.user.role !== "admin_service") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const expertId = req.params.id;
    const { motif } = req.body;

    // Supprimer l'expert (ou mettre statut 'suspendu' si vous préférez garder)
    const result = await pool.query(
      `DELETE FROM utilisateurs
       WHERE id_utilisateur = $1 AND role_global = 'expert'
       RETURNING id_utilisateur`,
      [expertId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expert introuvable" });
    }

    // TODO: Envoyer un email au candidat avec le motif

    res.json({ message: "Candidature refusée" });
  } catch (err) {
    console.error("REJECT EXPERT ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


/*
   ADMIN → STATISTIQUES GLOBALES
   GET /api/admin/stats
*/
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin_global" && req.user.role !== "admin_service") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const [usersResult, appointmentsResult, modeResult, recentAppointmentsResult, recentUsersResult] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE role_global = 'patient')::int AS patients,
          COUNT(*) FILTER (WHERE role_global = 'expert')::int AS experts,
          COUNT(*) FILTER (WHERE role_global = 'expert' AND statut = 'pending')::int AS pending_experts,
          COUNT(*) FILTER (WHERE role_global = 'expert' AND statut = 'actif')::int AS active_experts,
          COUNT(*) FILTER (WHERE role_global = 'admin_global')::int AS admins
        FROM utilisateurs`
      ),
      pool.query(
        `SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE statut = 'demande')::int AS pending,
          COUNT(*) FILTER (WHERE statut = 'confirme')::int AS confirmed,
          COUNT(*) FILTER (WHERE statut = 'termine')::int AS completed,
          COUNT(*) FILTER (WHERE statut = 'annule')::int AS cancelled,
          COUNT(*) FILTER (WHERE statut = 'refuse')::int AS refused
        FROM rendez_vous`
      ),
      pool.query(
        `SELECT
          COALESCE(mode, 'non_renseigne') AS mode,
          COUNT(*)::int AS count
        FROM rendez_vous
        GROUP BY COALESCE(mode, 'non_renseigne')
        ORDER BY count DESC`
      ),
      pool.query(
        `SELECT
          r.id_rdv,
          r.statut,
          r.mode,
          TO_CHAR(r.date_heure, 'YYYY-MM-DD') AS date_rdv,
          TO_CHAR(r.date_heure, 'HH24:MI') AS heure_rdv,
          patient.nom_complet AS patient_name,
          expert.nom_complet AS expert_name
        FROM rendez_vous r
        JOIN utilisateurs patient ON patient.id_utilisateur = r.id_patient
        JOIN utilisateurs expert ON expert.id_utilisateur = r.id_expert
        ORDER BY r.date_heure DESC
        LIMIT 5`
      ),
      pool.query(
        `SELECT
          id_utilisateur,
          nom_complet,
          email,
          role_global,
          statut,
          date_creation
        FROM utilisateurs
        ORDER BY date_creation DESC
        LIMIT 5`
      )
    ]);

    const users = usersResult.rows[0];
    const appointments = appointmentsResult.rows[0];
    const modes = modeResult.rows.reduce((acc, row) => {
      acc[row.mode] = row.count;
      return acc;
    }, {});

    res.json({
      users: {
        patients: users.patients,
        experts: users.experts,
        pendingExperts: users.pending_experts,
        activeExperts: users.active_experts,
        admins: users.admins,
      },
      appointments: {
        total: appointments.total,
        pending: appointments.pending,
        confirmed: appointments.confirmed,
        completed: appointments.completed,
        cancelled: appointments.cancelled,
        refused: appointments.refused,
      },
      appointmentModes: modes,
      recentAppointments: recentAppointmentsResult.rows,
      recentUsers: recentUsersResult.rows,
    });
  } catch (err) {
    console.error("GET ADMIN STATS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;