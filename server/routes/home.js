// routes/home.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'global_music_mongo';
const collectionName = "realtime_listening";

// GET /api/home/top-songs
router.get('/top-songs', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT title, popularity_score
      FROM Songs
      ORDER BY popularity_score DESC, title
      LIMIT 20;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top songs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/home/top-albums
router.get('/top-albums', async (req, res) => {
  try {
    const query = `
      SELECT al.title AS album_title,
             ar.name AS artist_name,
             AVG(s.popularity_score) AS avg_album_popularity,
             COUNT(s.song_id) AS total_songs
      FROM Albums al
      JOIN Songs s ON al.album_id = s.album_id
      JOIN Artists ar ON al.artist_id = ar.artist_id
      GROUP BY al.title, ar.name
      ORDER BY avg_album_popularity DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top albums:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/home/top-playlists
router.get('/top-playlists', async (req, res) => {
  try {
    const query = `
      SELECT p.name AS playlist_name,
             SUM(s.popularity_score) AS total_playlist_popularity,
             COUNT(DISTINCT s.song_id) AS total_songs
      FROM playlists p
      JOIN playlistsongs ps ON p.playlist_id = ps.playlist_id
      JOIN songs s ON ps.song_id = s.song_id
      GROUP BY p.name
      ORDER BY total_playlist_popularity DESC
      LIMIT 10;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top playlists:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/home/playlist-recent-hits  
router.get('/playlist-recent-hits', async (req, res) => {
  try {
    const query = `
      WITH recent_top AS (                              
          SELECT DISTINCT song_id
          FROM   countryrankings
          WHERE  date >= CURRENT_DATE - INTERVAL '365 days'
            AND  rank_position <= 50
      ),
      playlist_stats AS (
          SELECT ps.playlist_id,
                 COUNT(*)          AS total_songs,
                 COUNT(rt.song_id) AS hit_songs
          FROM   playlistsongs ps
          LEFT   JOIN recent_top rt USING (song_id)
          GROUP  BY ps.playlist_id
      )
      SELECT p.playlist_id,
             p.name,
             ROUND(hit_songs::NUMERIC / NULLIF(total_songs,0), 3) AS recent_hit_rate
      FROM   playlist_stats ps
      JOIN   playlists p USING (playlist_id)
      WHERE  ROUND(hit_songs::NUMERIC / NULLIF(total_songs,0), 3) NOT IN (0, 1)
      ORDER  BY recent_hit_rate DESC
      LIMIT  20;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching playlist recent hits:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/global-trends", async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
  const start = new Date(dateStr);
  const end = new Date(dateStr);
  end.setDate(end.getDate() + 1);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const raw = await collection
      .find({ timestamp: { $gte: start, $lt: end } })
      .toArray();

    const result = {};

    raw.forEach((doc) => {
      const country = doc.country;
      if (!result[country]) result[country] = [];
      result[country].push({
        song_title: doc.song_title || doc.title || "N/A",
        artist: doc.artist || "Unknown",
        listener_count: doc.listener_count || doc.streams || 0,
      });
    });

    Object.keys(result).forEach((country) => {
      result[country] = result[country]
        .sort((a, b) => b.listener_count - a.listener_count)
        .slice(0, 3);
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching global trends:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

module.exports = router;