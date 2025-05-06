const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/trends/top-songs-by-country
// takes a while to run right now since it displays all countries
router.get('/top-songs-by-country', async (req, res) => {
  try {
    const query = `
      WITH unique_country_songs AS (
        SELECT DISTINCT cr.country, s.song_id, s.title, s.popularity_score
        FROM countryrankings cr
        JOIN songs s ON cr.song_id = s.song_id
      ),
      ranked_songs AS (
        SELECT
          country,
          song_id,
          title,
          popularity_score,
          ROW_NUMBER() OVER (
            PARTITION BY country
            ORDER BY popularity_score DESC
          ) AS rank
        FROM unique_country_songs
      ),
      ranked_with_artists AS (
        SELECT
          rs.country,
          rs.song_id,
          rs.title,
          rs.popularity_score,
          STRING_AGG(a.name, ', ') AS artist_names,
          rs.rank
        FROM ranked_songs rs
        JOIN artistsong aso ON rs.song_id = aso.song_id
        JOIN artists a ON aso.artist_id = a.artist_id
        WHERE rs.rank <= 5
        GROUP BY rs.country, rs.song_id, rs.title, rs.popularity_score, rs.rank
      )
      SELECT
        country,
        song_id,
        title,
        artist_names,
        popularity_score,
        rank
      FROM ranked_with_artists
      ORDER BY country, rank;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top songs by country:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/trends/top-country-per-song
router.get('/top-country-per-song', async (req, res) => {
  try {
    const query = `
      WITH song_country_counts AS (
        SELECT
            cr.song_id,
            cr.country,
            COUNT(DISTINCT cr.ranking_id) AS chart_appearances
        FROM countryrankings cr
        GROUP BY cr.song_id, cr.country
      ),
      ranked_countries AS (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY song_id
                ORDER BY chart_appearances DESC
            ) AS country_rank
        FROM song_country_counts
      ),
      top_countries AS (
        SELECT
            sc.song_id,
            s.title,
            sc.country AS top_country,
            sc.chart_appearances
        FROM ranked_countries sc
        JOIN songs s ON s.song_id = sc.song_id
        WHERE sc.country_rank = 1
      )
      SELECT *
      FROM top_countries
      ORDER BY chart_appearances DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top country per song:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/home/albums-by-country
router.get('/albums-by-country', async (req, res) => {
  try {
    const query = `
      SELECT
        cr.country,
        COUNT(DISTINCT al.album_id) AS album_count
      FROM countryrankings cr
      JOIN songs s ON cr.song_id = s.song_id
      JOIN albums al ON s.album_id = al.album_id
      GROUP BY cr.country
      ORDER BY album_count DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching album count by country:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
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