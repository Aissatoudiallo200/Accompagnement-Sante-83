import { pool } from "../db.js";

export const searchPartners = async (req, res) => {
  try {
    const { q, service } = req.query;

    let sql = `
      SELECT
        u.id_utilisateur,
        u.nom_complet,
        u.email,
        s.nom_service AS service
      FROM utilisateurs u
      LEFT JOIN user_services us ON us.id_utilisateur = u.id_utilisateur
      LEFT JOIN services s ON s.id_service = us.id_service
      WHERE u.role_global = 'expert'
      AND u.statut = 'actif'
    `;

    const params = [];

    if (q) {
      params.push(`%${q}%`);
      sql += ` AND u.nom_complet ILIKE $${params.length}`;
    }

    if (service && service !== "all") {
      params.push(service);
      sql += ` AND s.nom_service = $${params.length}`;
    }

    sql += " ORDER BY u.nom_complet ASC";

    const result = await pool.query(sql, params);
    res.json(
      result.rows.map((row) => {
        const [prenom, ...nomParts] = row.nom_complet.split(" ");
        return {
          ...row,
          prenom,
          nom: nomParts.join(" ") || prenom,
        };
      })
    );
  } catch (err) {
    console.error("SEARCH PARTNERS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
