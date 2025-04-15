const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/db-tables', async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
      `);
    res.json({ tables: result.rows });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: 'Failed to fetch table list' });
  }
});

module.exports = router;
