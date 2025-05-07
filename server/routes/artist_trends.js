const express = require('express');
const router = express.Router();
const pool = require('../db');


//GET /api/artist_trends/popular-songs
router.get('/popular-songs', async (req, res) => {
  try {
    const query = `
      SELECT a.name,
             COUNT(*) AS popular_song_count
      FROM artists a
      JOIN artistsong aso ON a.artist_id = aso.artist_id
      JOIN songs s ON aso.song_id = s.song_id
      WHERE s.popularity_score > 80
      GROUP BY a.name
      ORDER BY popular_song_count DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching popular artists:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/artist_trends/global_artist_impact
router.get('/global_artist_impact', async (req, res) => {
  try {
    const { rows:[{ max_date }] } = await pool.query(
      `SELECT MAX(date) AS max_date FROM countryrankings`
    );

    const query = `
      WITH recent AS (
        SELECT song_id, streams, rank_position
          FROM countryrankings
         WHERE date BETWEEN $1::date - INTERVAL '14 days'
                         AND $1::date
      ), song_score AS (
        SELECT song_id,
               SUM(streams::NUMERIC / NULLIF(rank_position,0)) AS impact
          FROM recent
         GROUP BY song_id
      ), artist_score AS (
        SELECT aso.artist_id,
               SUM(ss.impact) AS global_impact
          FROM song_score ss
          JOIN artistsong aso ON ss.song_id = aso.song_id
         GROUP BY aso.artist_id
      )
      SELECT a.artist_id,
             a.name,
             ROUND(as2.global_impact,2) AS impact_score
        FROM artist_score as2
        JOIN artists a USING (artist_id)
       ORDER BY impact_score DESC
       LIMIT 20;
    `;
    const result = await pool.query(query, [max_date]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
