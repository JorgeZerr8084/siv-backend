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
    'RESET': 'RESET'
  };

  const value = CODES[key];

  if (!value) {
    return res.status(400).json({ error: 'Código inválido' });
  }

  // 🔥 RESET
  if (value === 'RESET') {
    await db.query('DELETE FROM license');
    return res.json({ success: true, reset: true });
  }

  const now = Date.now();

  // 🔎 traer licencia actual
  const existing = await db.query('SELECT * FROM license LIMIT 1');
  const current = existing.rows[0];

  let baseDate = now;

  if (current && current.date && current.days) {
    const exp = Number(current.date) + (current.days * 86400000);

    // 👉 si todavía no venció, acumula desde la fecha de expiración
    if (exp > now) {
      baseDate = exp;
    }
  }

  // 🔥 sumar días correctamente
  const newExp = baseDate + (value * 86400000);
  const totalDays = Math.ceil((newExp - now) / 86400000);

  await db.query('DELETE FROM license');

  const result = await db.query(
    'INSERT INTO license (key, date, days) VALUES ($1,$2,$3) RETURNING *',
    [key, now, totalDays]
  );

  res.json(result.rows[0]);
});

module.exports = router;