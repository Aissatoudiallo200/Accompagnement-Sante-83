import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads/resources");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Seuls les fichiers PDF sont autorisés"));
    }
    cb(null, true);
  },
});

function isAdmin(req) {
  return req.user.role === "admin_global" || req.user.role === "admin_service";
}

/*
   GET RESSOURCES PUBLIÉES
   GET /api/resources
*/
router.get("/", requireAuth, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id_ressource,
        titre,
        description,
        categorie AS service,
        type,
        statut,
        fichier_nom,
        created_at,
        'Équipe administrative' AS validateur
       FROM ressources_admin
       WHERE statut = 'published'
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET RESOURCES ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/*
   GET RESSOURCES ADMIN
   GET /api/resources/admin
*/
router.get("/admin", requireAuth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Accès refusé" });

    const result = await pool.query(
      `SELECT
        id_ressource,
        titre,
        description,
        categorie,
        type,
        statut,
        fichier_nom,
        created_at,
        updated_at
       FROM ressources_admin
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET ADMIN RESOURCES ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/*
   POST RESSOURCE ADMIN
   POST /api/resources/admin
*/
router.post("/admin", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Accès refusé" });
    if (!req.file) return res.status(400).json({ error: "Fichier PDF requis" });

    const { titre, description, categorie, statut = "published" } = req.body;

    if (!titre?.trim() || !categorie?.trim()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Titre et catégorie requis" });
    }

    const result = await pool.query(
      `INSERT INTO ressources_admin
       (titre, description, categorie, type, statut, fichier_nom, fichier_path, created_by)
       VALUES ($1, $2, $3, 'PDF', $4, $5, $6, $7)
       RETURNING id_ressource, titre, description, categorie, type, statut, fichier_nom, created_at`,
      [
        titre.trim(),
        description?.trim() || null,
        categorie.trim(),
        statut === "draft" ? "draft" : "published",
        req.file.originalname,
        req.file.filename,
        req.user.id_utilisateur,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("CREATE ADMIN RESOURCE ERROR:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});



/*
   PATCH RESSOURCE ADMIN
   PATCH /api/resources/admin/:id
*/
router.patch("/admin/:id", requireAuth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Accès refusé" });

    const { titre, description, categorie, statut } = req.body;

    if (!titre?.trim() || !categorie?.trim()) {
      return res.status(400).json({ error: "Titre et catégorie requis" });
    }

    if (!["draft", "published", "archived"].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const result = await pool.query(
      `UPDATE ressources_admin
       SET titre = $1,
           description = $2,
           categorie = $3,
           statut = $4,
           updated_at = NOW()
       WHERE id_ressource = $5
       RETURNING id_ressource, titre, description, categorie, type, statut, fichier_nom, created_at, updated_at`,
      [titre.trim(), description?.trim() || null, categorie.trim(), statut, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Ressource introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE ADMIN RESOURCE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/*
   PATCH STATUT RESSOURCE ADMIN
   PATCH /api/resources/admin/:id/status
*/
router.patch("/admin/:id/status", requireAuth, async (req, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Accès refusé" });

    const { statut } = req.body;
    if (!["draft", "published", "archived"].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const result = await pool.query(
      `UPDATE ressources_admin
       SET statut = $1, updated_at = NOW()
       WHERE id_ressource = $2
       RETURNING id_ressource, statut`,
      [statut, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Ressource introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE RESOURCE STATUS ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/*
   DOWNLOAD RESSOURCE
   GET /api/resources/:id/download
*/
router.get("/:id/download", requireAuth, async (req, res) => {
  try {
    const params = [req.params.id];
    const statusFilter = isAdmin(req) ? "" : "AND statut = 'published'";
    const result = await pool.query(
      `SELECT fichier_nom, fichier_path
       FROM ressources_admin
       WHERE id_ressource = $1 ${statusFilter}`,
      params
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Ressource introuvable" });

    const resource = result.rows[0];
    const filePath = path.join(uploadDir, resource.fichier_path);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Fichier introuvable" });

    res.download(filePath, resource.fichier_nom);
  } catch (err) {
    console.error("DOWNLOAD RESOURCE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
