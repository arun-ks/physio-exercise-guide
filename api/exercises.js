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
    const { exid } = req.query;

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const result = exid
      ? await db.execute({
          sql: `SELECT * FROM Exercises WHERE ExID = ?`,
          args: [exid]
        })
      : await db.execute(`SELECT * FROM Exercises ORDER BY SortOrder ASC`);

    res.status(200).json(rowsToObjects(result));
  } catch (err) {
    console.error("EXERCISES API ERROR:", err);
    res.status(500).json({ error: "Failed to load exercises", details: err.message });
  }
}
