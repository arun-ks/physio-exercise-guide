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
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const result = await db.execute(`
      SELECT
        ExID,
        Name,
        Instructions,
        RepCount,
        RepDurationSec,
        RepBreakSec,
        SetsCount,
        SetBreakSec,
        Image1,
        Image2,
        Image3,
        AlternateNames,
        MuscleGroups,
        DifficultyLevel,
        SortOrder
      FROM Exercises
      ORDER BY SortOrder ASC
    `);

    res.status(200).json(rowsToObjects(result));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load exercises",
      details: err.message
    });
  }
}
