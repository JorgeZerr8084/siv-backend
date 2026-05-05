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

  const CODES = {
    'Activate1Month.!': 30,
    'Activate2Month.!': 60,
    'Activate3Month.!': 90,
    'RESET': -999
  };
  const days = 0;
  const days = CODES[key];

  if (!days) {
    return res.status(400).json({ error: 'Código inválido' });
  }

  const now = Date.now();

  await db.query('DELETE FROM license');

  const result = await db.query(
    'INSERT INTO license (key, date, days) VALUES ($1,$2,$3) RETURNING *',
    [key, now, days]
  );

  res.json(result.rows[0]);
});

module.exports = router;