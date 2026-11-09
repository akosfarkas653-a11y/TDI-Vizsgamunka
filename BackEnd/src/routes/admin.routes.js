const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Új tanár létrehozása (csak admin)
router.post('/teachers', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Név, email és jelszó kötelező!' });
    }

    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'teacher']
    );

    res.status(201).json({ message: 'Tanár sikeresen létrehozva', teacherId: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Ez az email cím már foglalt!' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Felhasználók listázása szerepkör szerint
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, role, is_deleted, created_at FROM users WHERE is_deleted = 0';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    const users = await db.all(sql, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Felhasználó soft delete (diák vagy tanár)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await db.run('UPDATE users SET is_deleted = 1 WHERE id = ?', [userId]);
    res.json({ message: 'Felhasználó sikeresen inaktiválva (soft delete)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

