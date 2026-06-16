import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/* 
   GET PROFIL PATIENT
   GET /api/patient/profile
*/
router.get("/profile", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const result = await pool.query(
      `SELECT 
        id_utilisateur,
        nom_complet,
        email,
        telephone
      FROM utilisateurs
      WHERE id_utilisateur = $1 AND role_global = 'patient'
      LIMIT 1`,
      [req.user.id_utilisateur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profil introuvable" });
    }

    // Séparer nom_complet en nom et prenom
    const user = result.rows[0];
    const [prenom, ...nomParts] = user.nom_complet.split(" ");
    const nom = nomParts.join(" ");

    res.json({
      id_utilisateur: user.id_utilisateur,
      nom: nom || prenom,
      prenom: prenom,
      email: user.email,
      telephone: user.telephone
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* 
   GET STATISTIQUES PATIENT
   GET /api/patient/stats
*/
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const id_patient = req.user.id_utilisateur;

    // Total RDV
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM rendez_vous WHERE id_patient = $1`,
      [id_patient]
    );

    // RDV à venir (demande + confirmés)
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) as count FROM rendez_vous 
       WHERE id_patient = $1 
       AND statut IN ('demande', 'confirme')
       AND date_heure >= NOW()`,
      [id_patient]
    );

    // RDV terminés
    const completedResult = await pool.query(
      `SELECT COUNT(*) as count FROM rendez_vous 
       WHERE id_patient = $1 
       AND statut = 'termine'`,
      [id_patient]
    );

    // Messages (placeholder - à implémenter)
    const messages = 0;

    res.json({
      totalAppointments: parseInt(totalResult.rows[0].count),
      upcomingAppointments: parseInt(upcomingResult.rows[0].count),
      completedAppointments: parseInt(completedResult.rows[0].count),
      messages: messages
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;