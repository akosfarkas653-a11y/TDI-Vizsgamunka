const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Összes tantárgy listázása (legördülő mezőkhöz)
router.get('/', async (req, res) => {
  try {
    const subjects = await db.all('SELECT id, name FROM subjects ORDER BY name ASC');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Új tantárgy hozzáadása (opcionális, pl. adminnak)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'A tantárgy neve kötelező!' });
    }
    const result = await db.run('INSERT INTO subjects (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ message: 'Tantárgy sikeresen rögzítve', id: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Ez a tantárgy már létezik!' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

