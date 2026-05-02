const express = require('express');
const router = express.Router();
const db = require('../db');

// GET licencia
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM license LIMIT 1');
  res.json(result.rows[0] || null);
});

// SET licencia
router.post('/', async (req, res) => {
  const { key } = req.body;

  await db.query('DELETE FROM license');

  const result = await db.query(
    'INSERT INTO license (key) VALUES ($1) RETURNING *',
    [key]
  );

  res.json(result.rows[0]);
});

module.exports = router;