const express = require('express');
const router = express.Router();
const db = require('../db');

// GET todos
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM products WHERE active = true ORDER BY id DESC');
  res.json(result.rows);
});

// POST crear producto
router.post('/', async (req, res) => {
  const { name, price, stock } = req.body;

  const result = await db.query(
    'INSERT INTO products (name, price, stock, updated_at) VALUES ($1,$2,$3,$4) RETURNING *',
    [name, price, stock || 0, Date.now()]
  );

  res.json(result.rows[0]);
});

// PUT actualizar producto
router.put('/:id', async (req, res) => {
  const { name, price, stock } = req.body;
  const { id } = req.params;

  const result = await db.query(
    `UPDATE products 
     SET name=$1, price=$2, stock=$3, updated_at=$4
     WHERE id=$5
     RETURNING *`,
    [name, price, stock, Date.now(), id]
  );

  res.json(result.rows[0]);
});

// PATCH descontar stock (venta)
router.patch('/:id/stock', async (req, res) => {
  const { qty } = req.body;
  const { id } = req.params;

  const result = await db.query(
    `UPDATE products 
     SET stock = stock - $1, updated_at=$2
     WHERE id=$3
     RETURNING *`,
    [qty, Date.now(), id]
  );

  res.json(result.rows[0]);
});

// DELETE (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await db.query(
    'UPDATE products SET active=false WHERE id=$1',
    [id]
  );

  res.json({ success: true });
});

module.exports = router;