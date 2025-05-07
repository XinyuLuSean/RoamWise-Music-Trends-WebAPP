const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/trends/countries
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

// GET /api/trends/top-songs-by-country?country=US
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

// GET /api/trends/albums-by-country
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

// GET /api/trends/top-country-per-song
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

// GET /api/trends/global_artist_impact
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
