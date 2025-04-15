// routes/home.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'global_music_mongo';
const collectionName = 'lastfm_top_tracks';

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

router.get('/global-trends', async (req, res) => {
    const date = req.query.date || new Date().toISOString().slice(0, 10); // 默认是今天的日期
  
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      const results = await collection.find({ date: date }, { projection: { _id: 0 } }).toArray();
      res.json(results);
    } catch (err) {
      console.error('Error fetching global trends:', err);
      res.status(500).send('Internal Server Error');
    } finally {
      await client.close();
    }
  });

module.exports = router;

