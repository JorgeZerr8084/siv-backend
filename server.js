require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 TEST DB
db.query('SELECT NOW()')
  .then(res => console.log('DB conectada:', res.rows[0]))
  .catch(err => console.error('Error DB:', err));

// 🔹 TEST RUTA SIMPLE
app.get('/', (req, res) => {
  res.send('OK');
});

// 🔹 RUTAS REALES
app.use('/api/sales', require('./routes/sales'));
app.use('/api/license', require('./routes/license'));
app.use('/api/products', require('./routes/products'));

// 🔹 ARRANCAR SERVIDOR (ESTO ES LO QUE TE FALTA)
app.listen(process.env.PORT, () => {
  console.log('Servidor corriendo en puerto', process.env.PORT);
});