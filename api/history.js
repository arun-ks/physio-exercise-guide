import { db } from "./_lib/db.js";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    const { UserID, ExID, CompletedTime } = req.body;

    await db.execute({
      sql: `
        INSERT INTO WorkoutHistory (UserID, ExID, CompletedTime)
        VALUES (?, ?, ?)
      `,
      args: [UserID, ExID, CompletedTime]
    });

    res.json({ ok: true });
    return;
  }

  if (method === "GET") {
    const { userId } = req.query;

    const result = await db.execute({
      sql: `
        SELECT ExID, MAX(CompletedTime) as LastCompletedTime
        FROM WorkoutHistory
        WHERE UserID = ?
        GROUP BY ExID
      `,
      args: [userId]
    });

    res.json(result.rows);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
