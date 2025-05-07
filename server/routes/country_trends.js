const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/country_trends/countries
router.get('/countries', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT country
        FROM countryrankings
       ORDER BY country;
    `);
    res.json(rows.map(r => r.country));
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/country_trends/top-songs-by-country?country=US
router.get('/top-songs-by-country', async (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res
      .status(400)
      .json({ error: 'Missing country parameter, e.g. ?country=US' });
  }

  try {
    const { rows } = await pool.query(
      `
      WITH unique_songs AS (
        SELECT DISTINCT cr.song_id, s.title, s.popularity_score
          FROM countryrankings cr
          JOIN songs s ON cr.song_id = s.song_id
         WHERE cr.country = $1
      ), ranked AS (
        SELECT 
          us.song_id,
          us.title,
          us.popularity_score,
          ROW_NUMBER() OVER (ORDER BY us.popularity_score DESC) AS rank
        FROM unique_songs us
      )
      SELECT 
        r.song_id,
        r.title,
        r.popularity_score,
        r.rank
      FROM ranked r
     WHERE r.rank <= 10
     ORDER BY r.rank;
      `,
      [country]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top songs for country:', country, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/country_trends/albums-by-country
router.get('/albums-by-country', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        cr.country,
        COUNT(DISTINCT al.album_id) AS album_count
      FROM countryrankings cr
      JOIN songs s ON cr.song_id = s.song_id
      JOIN albums al ON s.album_id = al.album_id
      GROUP BY cr.country
      ORDER BY album_count DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching album count by country:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/country_trends/jaccard_similarity?date=2025-04-04
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
