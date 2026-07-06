import { db } from "./_lib/db.js";

function rowsToObjects(result) {
  return result.rows.map(row => {
    const obj = {};
    result.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { UserID, ExID, CompletedTime } = req.body;

      await db.execute({
        sql: `
          INSERT INTO WorkoutHistory (UserID, ExID, CompletedTime)
          VALUES (?, ?, ?)
        `,
        args: [UserID, ExID, CompletedTime]
      });

      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      const { userId } = req.query;

      const result = await db.execute({
        sql: `
          SELECT
            ExID,
            MAX(CompletedTime) AS LastCompletedTime
          FROM WorkoutHistory
          WHERE UserID = ?
          GROUP BY ExID
        `,
        args: [userId]
      });

      return res.status(200).json(rowsToObjects(result));
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "History API failed",
      details: err.message
    });
  }
}
