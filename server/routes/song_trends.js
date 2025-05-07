const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/song_trends/top-country-per-song
router.get('/top-country-per-song', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      WITH song_country_counts AS (
        SELECT cr.song_id,
               cr.country,
               COUNT(*) AS chart_appearances
          FROM countryrankings cr
         GROUP BY cr.song_id, cr.country
      ), ranked_countries AS (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY song_id
                 ORDER BY chart_appearances DESC
               ) AS country_rank
          FROM song_country_counts
      )
      SELECT sc.song_id,
             s.title,
             sc.country   AS top_country,
             sc.chart_appearances
        FROM ranked_countries sc
        JOIN songs s ON s.song_id = sc.song_id
       WHERE sc.country_rank = 1
       ORDER BY sc.chart_appearances DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top country per song:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
