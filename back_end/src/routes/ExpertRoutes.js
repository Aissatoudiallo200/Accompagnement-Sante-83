import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

/* 
   GET PROFIL EXPERT
   GET /api/expert/profile
*/
router.get("/profile", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Récupérer les infos de l'expert
    const result = await pool.query(
      `SELECT 
        u.id_utilisateur,
        u.nom_complet,
        u.email,
        u.telephone,
        u.statut,
        u.date_creation,
        s.nom_service AS service
      FROM utilisateurs u
      LEFT JOIN user_services us ON us.id_utilisateur = u.id_utilisateur
      LEFT JOIN services s ON s.id_service = us.id_service
      WHERE u.id_utilisateur = $1 AND u.role_global = 'expert'
      LIMIT 1`,
      [req.user.id_utilisateur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profil introuvable" });
    }

    const user = result.rows[0];
    
    // Séparer nom_complet en nom et prenom
    const [prenom, ...nomParts] = user.nom_complet.split(" ");
    const nom = nomParts.join(" ") || "";

    res.json({
      id_utilisateur: user.id_utilisateur,
      nom: nom || prenom,
      prenom: prenom,
      email: user.email,
      telephone: user.telephone,
      service: user.service,
      statut: user.statut,
      date_creation: user.date_creation,
      date_naissance: user.date_naissance || null
    });
  } catch (err) {
    console.error("GET EXPERT PROFILE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* 
   GET STATISTIQUES EXPERT
   GET /api/expert/stats
*/
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const id_expert = req.user.id_utilisateur;

    // RDV aujourd'hui - PostgreSQL: CURRENT_DATE au lieu de CURDATE()
    const todayResult = await pool.query(
      `SELECT COUNT(*) as count FROM rendez_vous 
       WHERE id_expert = $1
       AND DATE(date_heure) = CURRENT_DATE
       AND statut IN ('demande', 'confirme')`,
      [id_expert]
    );

    // RDV à venir
    const upcomingResult = await pool.query(
      `SELECT COUNT(*) as count FROM rendez_vous 
       WHERE id_expert = $1
       AND statut = 'confirme'
       AND date_heure >= NOW()`,
      [id_expert]
    );

    // Patients suivis (nombre unique de patients)
    const patientsResult = await pool.query(
      `SELECT COUNT(DISTINCT id_patient) as count FROM rendez_vous 
       WHERE id_expert = $1`,
      [id_expert]
    );

    res.json({
      todayAppointments: parseInt(todayResult.rows[0].count),
      upcomingAppointments: parseInt(upcomingResult.rows[0].count),
      totalPatients: parseInt(patientsResult.rows[0].count),
      satisfaction: 4.9
    });
  } catch (err) {
    console.error("GET EXPERT STATS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* 
   GET PATIENTS SUIVIS
   GET /api/expert/patients
*/
router.get("/patients", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const id_expert = req.user.id_utilisateur;

    const result = await pool.query(
      `SELECT 
        u.id_utilisateur as id_patient,
        u.nom_complet as nom,
        COUNT(r.id_rdv) as total_rdv,
        SUM(CASE WHEN r.statut = 'termine' THEN 1 ELSE 0 END) as rdv_termines
      FROM rendez_vous r
      JOIN utilisateurs u ON r.id_patient = u.id_utilisateur
      WHERE r.id_expert = $1
      GROUP BY u.id_utilisateur, u.nom_complet
      ORDER BY total_rdv DESC`,
      [id_expert]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET EXPERT PATIENTS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;