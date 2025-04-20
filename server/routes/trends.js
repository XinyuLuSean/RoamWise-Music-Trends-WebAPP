const express = require('express');
const router = express.Router();
const pool = require('../db');
  
// GET /api/global_artist_impact
router.get('/global_artist_impact', async (req, res) => {
    try {
      const query = `
        WITH recent AS (
          SELECT cr.song_id, cr.streams, cr.rank_position, cr.date
          FROM countryrankings cr
          WHERE  cr.date BETWEEN DATE '2025-03-16' - INTERVAL '14 days' AND DATE '2025-03-16'
        ),
        song_score AS (
          SELECT song_id,
                 SUM(streams::NUMERIC / NULLIF(rank_position, 0)) AS impact
          FROM recent
          GROUP BY song_id
        ),
        artist_score AS (
          SELECT aso.artist_id,
                 SUM(ss.impact) AS global_impact
          FROM song_score ss
          JOIN artistsong aso ON ss.song_id = aso.song_id
          GROUP BY aso.artist_id
        )
        SELECT a.artist_id, a.name, ROUND(global_impact, 2) AS impact_score
        FROM artist_score as2
        JOIN artists a USING (artist_id)
        ORDER BY impact_score DESC
        LIMIT 20;
      `;
  
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching artist impact ranking:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
