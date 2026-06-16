import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { sendVerificationEmail } from "../emailService.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

function generateEmailCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ======================================================
   INSCRIPTION PATIENT (EMAIL + CODE)
   ====================================================== */
router.post("/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const { nom_complet, email, telephone, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!nom_complet || !normalizedEmail || !telephone || !password) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    await client.query("BEGIN");

    const exists = await client.query(
      `SELECT id_utilisateur, role_global, statut
       FROM utilisateurs
       WHERE email = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    const existingUser = exists.rows[0];

    if (
      existingUser &&
      !(existingUser.role_global === "patient" && existingUser.statut === "pending_email")
    ) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const code = generateEmailCode();
    const codeHash = await bcrypt.hash(code, 10);
    const passwordHash = await bcrypt.hash(password, 10);

    let userId = existingUser?.id_utilisateur;

    if (userId) {
      await client.query(
        `UPDATE utilisateurs
         SET nom_complet = $1,
             telephone = $2,
             mot_de_passe = $3,
             email_verified = FALSE,
             statut = 'pending_email'
         WHERE id_utilisateur = $4`,
        [nom_complet, telephone, passwordHash, userId]
      );
    } else {
      const insertResult = await client.query(
        `INSERT INTO utilisateurs
         (nom_complet, email, telephone, role_global, mot_de_passe, statut, email_verified)
         VALUES ($1, $2, $3, 'patient', $4, 'pending_email', FALSE)
         RETURNING id_utilisateur`,
        [nom_complet, normalizedEmail, telephone, passwordHash]
      );

      userId = insertResult.rows[0].id_utilisateur;
    }

    await client.query(
      `UPDATE email_verifications
       SET used_at = NOW()
       WHERE id_utilisateur = $1
         AND used_at IS NULL`,
      [userId]
    );

    await client.query(
      `INSERT INTO email_verifications
       (id_utilisateur, email, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [userId, normalizedEmail, codeHash]
    );

    await client.query("COMMIT");

    await sendVerificationEmail(normalizedEmail, code);

    res.status(201).json({
      message: "Code envoyé par email",
      email: normalizedEmail,
      userId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ======================================================
   RENVOI DU CODE EMAIL PATIENT
   POST /api/auth/resend-email-code
   ====================================================== */
router.post("/resend-email-code", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email requis" });
    }

    const pendingResult = await pool.query(
      `SELECT id_utilisateur, email
       FROM utilisateurs
       WHERE email = $1
         AND role_global = 'patient'
         AND statut = 'pending_email'
       LIMIT 1`,
      [normalizedEmail]
    );

    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ error: "Inscription en attente introuvable" });
    }

    const user = pendingResult.rows[0];
    const code = generateEmailCode();
    const codeHash = await bcrypt.hash(code, 10);

    await pool.query(
      `UPDATE email_verifications
       SET used_at = NOW()
       WHERE id_utilisateur = $1
         AND used_at IS NULL`,
      [user.id_utilisateur]
    );

    await pool.query(
      `INSERT INTO email_verifications
       (id_utilisateur, email, code_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
      [user.id_utilisateur, user.email, codeHash]
    );

    await sendVerificationEmail(user.email, code);

    res.json({ message: "Nouveau code envoyé" });
  } catch (err) {
    console.error("RESEND EMAIL CODE ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ======================================================
   INSCRIPTION EXPERT
   POST /api/auth/expert/register
   ====================================================== */
router.post("/expert/register", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      nom_complet,
      email,
      telephone,
      service_medical,
      password,
    } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      !nom_complet ||
      !normalizedEmail ||
      !telephone ||
      !service_medical ||
      !password
    ) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    await client.query("BEGIN");

    const exists = await client.query(
      "SELECT id_utilisateur FROM utilisateurs WHERE email = $1",
      [normalizedEmail]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const serviceResult = await client.query(
      `SELECT id_service
       FROM services
       WHERE nom_service = $1
       LIMIT 1`,
      [service_medical]
    );

    if (serviceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Service médical introuvable" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertResult = await client.query(
      `INSERT INTO utilisateurs
       (nom_complet, email, telephone, role_global, mot_de_passe, statut)
       VALUES ($1, $2, $3, 'expert', $4, 'pending')
       RETURNING id_utilisateur`,
      [nom_complet, normalizedEmail, telephone, passwordHash]
    );

    await client.query(
      `INSERT INTO user_services (id_utilisateur, id_service, role_local)
       VALUES ($1, $2, 'expert')`,
      [insertResult.rows[0].id_utilisateur, serviceResult.rows[0].id_service]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Demande d'inscription expert envoyée",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("EXPERT REGISTER ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ======================================================
   VALIDATION EMAIL → CRÉATION COMPTE PATIENT
   ====================================================== */
router.post("/verify-email", async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, code } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !code) {
      return res.status(400).json({ error: "Email et code requis" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `SELECT
         ev.id_utilisateur,
         ev.code_hash,
         ev.attempts,
         ev.expires_at
       FROM email_verifications ev
       JOIN utilisateurs u ON u.id_utilisateur = ev.id_utilisateur
       WHERE u.email = $1
         AND u.role_global = 'patient'
         AND u.statut = 'pending_email'
         AND ev.used_at IS NULL
         AND ev.expires_at > NOW()
       ORDER BY ev.created_at DESC
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    const v = result.rows[0];

    if (v.attempts >= 5) {
      await client.query("ROLLBACK");
      return res.status(429).json({ error: "Trop de tentatives. Demandez un nouveau code." });
    }

    const isValidCode = await bcrypt.compare(code, v.code_hash);

    if (!isValidCode) {
      await client.query(
        `UPDATE email_verifications
         SET attempts = attempts + 1
         WHERE id_utilisateur = $1
           AND used_at IS NULL`,
        [v.id_utilisateur]
      );

      await client.query("COMMIT");
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    await client.query(
      `UPDATE utilisateurs
       SET statut = 'actif',
           email_verified = TRUE
       WHERE id_utilisateur = $1`,
      [v.id_utilisateur]
    );

    await client.query(
      `UPDATE email_verifications
       SET used_at = NOW()
       WHERE id_utilisateur = $1
         AND used_at IS NULL`,
      [v.id_utilisateur]
    );

    await client.query("COMMIT");

    const token = jwt.sign(
      { id_utilisateur: v.id_utilisateur, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ======================================================
   LOGIN PATIENT
   POST /api/auth/login
   ====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM utilisateurs
       WHERE email = $1 AND role_global = 'patient' AND statut = 'actif'
         AND email_verified = TRUE
       LIMIT 1`,
      [email?.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!isValid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = jwt.sign(
      { id_utilisateur: user.id_utilisateur, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ======================================================
   LOGIN PATIENT PARTENAIRE (EXPERT)
   POST /api/auth/expert/login
   ====================================================== */
router.post("/expert/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM utilisateurs
       WHERE email = $1 AND role_global = 'expert' AND statut = 'actif'
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Compte expert non validé ou introuvable" });
    }

    const expert = result.rows[0];
    const isValid = await bcrypt.compare(password, expert.mot_de_passe);

    if (!isValid) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id_utilisateur: expert.id_utilisateur, role: "expert" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* ======================================================
   LOGIN ADMIN GLOBAL
   POST /api/auth/admin/login
   ====================================================== */
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const result = await pool.query(
      `SELECT *
       FROM utilisateurs
       WHERE email = $1
         AND role_global = 'admin_global'
         AND statut = 'actif'
       LIMIT 1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Identifiants admin incorrects" });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.mot_de_passe);

    if (!isValid) {
      return res.status(401).json({ error: "Identifiants admin incorrects" });
    }

    const token = jwt.sign(
      { id_utilisateur: admin.id_utilisateur, role: "admin_global" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
