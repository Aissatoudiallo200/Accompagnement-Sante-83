export async function createNotification(db, { userId, type, title, message, link = null }) {
  if (!userId || !type || !title || !message) return null;

  const result = await db.query(
    `INSERT INTO notifications (id_utilisateur, type, titre, message, lien)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_notification`,
    [userId, type, title, message, link]
  );

  return result.rows[0];
}
