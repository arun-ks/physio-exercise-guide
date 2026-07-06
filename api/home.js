import { db } from "./_lib/db.js";

function rowsToObjects(result) {
  return result.rows.map(row => {
    const obj = {};
    result.columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

export default async function handler(req, res) {
  try {
    const { userId } = req.query;

    const result = await db.execute({
      sql: `
        SELECT
          e.*,
          MAX(h.CompletedTime) AS LastCompletedTime
        FROM Exercises e
        LEFT JOIN WorkoutHistory h
          ON e.ExID = h.ExID
          AND h.UserID = ?
        GROUP BY e.ExID
        ORDER BY e.SortOrder ASC
      `,
      args: [userId || ""]
    });

    res.status(200).json(rowsToObjects(result));
  } catch (err) {
    console.error("HOME API ERROR:", err);
    res.status(500).json({ error: "Home API failed", details: err.message });
  }
}
