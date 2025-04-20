const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/search/jaccard_similarity?date=2025-04-04
router.get('/jaccard_similarity', async (req, res) => {
  const targetDate = req.query.date;

  if (!targetDate) {
    return res.status(400).json({ error: 'Missing date parameter (e.g. ?date=2025-04-04)' });
  }

  const query = `
    WITH top50 AS (
      SELECT country, song_id
      FROM countryrankings
      WHERE date = $1
        AND rank_position <= 50
    ),
    pairwise AS (
      SELECT t1.country AS c1,
             t2.country AS c2,
             COUNT(*) AS intersection
      FROM top50 t1
      JOIN top50 t2
        ON t1.country < t2.country
       AND t1.song_id = t2.song_id
      GROUP BY t1.country, t2.country
    )
    SELECT p.c1,
           p.c2,
           ROUND(p.intersection::NUMERIC / (100 - p.intersection), 4) AS jaccard_sim
    FROM pairwise p
    ORDER BY jaccard_sim DESC;
  `;

  try {
    const result = await pool.query(query, [targetDate]);
    res.json(result.rows);
  } catch (err) {
    console.error('Jaccard query failed:', err);
    res.status(500).json({ error: 'Database error during Jaccard similarity computation' });
  }
});

module.exports = router;
