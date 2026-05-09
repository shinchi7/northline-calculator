const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u819269316_northline',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'u819269316_northline',
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

app.get('/api/papers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM papers ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/papers', async (req, res) => {
  const { name, width, height, price } = req.body;
  if (!name || !width || !height || price == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = uid();
  try {
    await pool.query(
      'INSERT INTO papers (id, name, width, height, price) VALUES (?, ?, ?, ?, ?)',
      [id, name, Number(width), Number(height), Number(price)]
    );
    res.status(201).json({ id, name, width: Number(width), height: Number(height), price: Number(price) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/papers/:id', async (req, res) => {
  const { name, width, height, price } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE papers SET name=?, width=?, height=?, price=? WHERE id=?',
      [name, Number(width), Number(height), Number(price), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Paper not found' });
    res.json({ id: req.params.id, name, width: Number(width), height: Number(height), price: Number(price) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/papers/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM papers WHERE id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Paper not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
