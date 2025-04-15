const express = require('express');
const router = express.Router();
const pool = require('../db'); 

//GET /api/artists/popular-songs
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

module.exports = router;
