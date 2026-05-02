const express = require('express');
const router = express.Router();
const db = require('../db');


// 🔹 GET ventas con items
router.get('/', async (req, res) => {
  try {
    const sales = await db.query(
      'SELECT * FROM sales ORDER BY datetime DESC'
    );

    const result = [];

    for (const sale of sales.rows) {
      const items = await db.query(
        'SELECT name, qty, price FROM sale_items WHERE sale_id = $1',
        [sale.id]
      );

      result.push({
        ...sale,
        items: items.rows
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo ventas' });
  }
});


// 🔹 POST nueva venta
router.post('/', async (req, res) => {
  const { datetime, total, payment, items, openingId } = req.body;

  try {
    const saleResult = await db.query(
      `INSERT INTO sales (datetime, total, payment, opening_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [datetime, total, payment, openingId]
    );

    const sale = saleResult.rows[0];

    for (const item of items) {
      await db.query(
        `INSERT INTO sale_items (sale_id, name, qty, price)
         VALUES ($1, $2, $3, $4)`,
        [sale.id, item.name, item.qty, item.price]
      );
    }

    res.json(sale);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando venta' });
  }
});

module.exports = router;