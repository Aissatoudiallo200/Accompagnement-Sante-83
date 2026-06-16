import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id_notification,
        type,
        titre,
        message,
        lien,
        lu,
        created_at
       FROM notifications
       WHERE id_utilisateur = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id_utilisateur]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET NOTIFICATIONS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/read", requireAuth, async (req, res) => {
  try {
    const { typePrefix } = req.body || {};
    const params = [req.user.id_utilisateur];
    const typeFilter = typePrefix ? "AND type LIKE $2" : "";

    if (typePrefix) {
      params.push(`${typePrefix}%`);
    }

    const result = await pool.query(
      `UPDATE notifications
       SET lu = true
       WHERE id_utilisateur = $1
         AND lu IS NOT TRUE
         ${typeFilter}
       RETURNING id_notification`,
      params
    );

    res.json({
      message: "Notifications lues",
      updated: result.rowCount,
    });
  } catch (err) {
    console.error("READ NOTIFICATIONS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET lu = true
       WHERE id_notification = $1 AND id_utilisateur = $2
       RETURNING id_notification`,
      [req.params.id, req.user.id_utilisateur]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    res.json({ message: "Notification lue" });
  } catch (err) {
    console.error("READ NOTIFICATION ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;
