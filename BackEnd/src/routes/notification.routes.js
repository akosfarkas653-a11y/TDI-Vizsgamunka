const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Felhasználó értesítéseinek listázása
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await db.all(
      'SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Értesítés olvasottnak jelölése
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ message: 'Értesítés olvasottnak jelölve' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

