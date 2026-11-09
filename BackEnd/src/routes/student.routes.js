const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Szabad órák keresése / listázása (tanár és tantárgy szerinti szűrés)
router.get('/lessons', async (req, res) => {
  try {
    const { teacher, subject } = req.query;
    let sql = `
      SELECT l.id, l.lesson_date, l.start_time, l.end_time, l.status,
             u.name AS teacher_name, u.email AS teacher_email,
             s.name AS subject_name
      FROM lessons l
      JOIN users u ON l.teacher_id = u.id
      JOIN subjects s ON l.subject_id = s.id
      WHERE l.status = 'free' AND u.is_deleted = 0
    `;
    const params = [];

    if (teacher) {
      sql += ' AND u.name LIKE ?';
      params.push(`%${teacher}%`);
    }
    if (subject) {
      sql += ' AND s.name LIKE ?';
      params.push(`%${subject}%`);
    }

    sql += ' ORDER BY l.lesson_date ASC, l.start_time ASC';

    const lessons = await db.all(sql, params);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Óra lefoglalása (ekkor állapota 'pending' lesz)
router.post('/book', async (req, res) => {
  try {
    const { lesson_id, student_id } = req.body;
    if (!lesson_id || !student_id) {
      return res.status(400).json({ error: 'lesson_id és student_id kötelező!' });
    }

    // Ellenőrizzük, hogy az óra még tényleg szabad-e
    const lesson = await db.get('SELECT status FROM lessons WHERE id = ?', [lesson_id]);
    if (!lesson || lesson.status !== 'free') {
      return res.status(400).json({ error: 'Ez az óra már nem foglalható!' });
    }

    // Foglalás rögzítése
    const result = await db.run(
      'INSERT INTO bookings (lesson_id, student_id, status) VALUES (?, ?, ?)',
      [lesson_id, student_id, 'pending']
    );

    // Óra állapotának frissítése 'pending'-re
    await db.run("UPDATE lessons SET status = 'pending' WHERE id = ?", [lesson_id]);

    res.status(201).json({ message: 'Foglalás sikeresen elküldve, tanári jóváhagyásra vár!', bookingId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Diák saját óráinak és foglalási állapotának megtekintése (Dashboard)
router.get('/my-bookings', async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'student_id kötelező paraméter!' });
    }

    const bookings = await db.all(
      `SELECT b.id AS booking_id, b.status AS booking_status, b.booked_at,
              l.id AS lesson_id, l.lesson_date, l.start_time, l.end_time,
              s.name AS subject_name,
              u.name AS teacher_name, u.email AS teacher_email
       FROM bookings b
       JOIN lessons l ON b.lesson_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       JOIN users u ON l.teacher_id = u.id
       WHERE b.student_id = ?
       ORDER BY l.lesson_date DESC, l.start_time DESC`,
      [student_id]
    );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Foglalás lemondása a diák részéről
// A tanár értesítést kap (dátum, időpont, tantárgy, diák neve), az óra állapota újra 'free' lesz
router.put('/bookings/:id/cancel', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Részletek lekérdezése az értesítéshez
    const details = await db.get(
      `SELECT b.lesson_id, b.student_id,
              l.teacher_id, l.lesson_date, l.start_time,
              s.name AS subject_name,
              st.name AS student_name
       FROM bookings b
       JOIN lessons l ON b.lesson_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       JOIN users st ON b.student_id = st.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!details) {
      return res.status(404).json({ error: 'A megadott foglalás nem található!' });
    }

    // Foglalás státuszának lemondottra állítása
    await db.run("UPDATE bookings SET status = 'cancelled_by_student' WHERE id = ?", [bookingId]);

    // Az óra visszanyitása mások számára
    await db.run("UPDATE lessons SET status = 'free' WHERE id = ?", [details.lesson_id]);

    // Értesítés küldése a tanárnak
    const notifyMsg = `${details.student_name} lemondta a foglalását: ${details.subject_name} (${details.lesson_date} ${details.start_time}).`;
    await db.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [details.teacher_id, notifyMsg]
    );

    res.json({ message: 'Foglalás lemondva, a tanár értesítést kapott.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Diák profil törlése megerősítés után (Soft delete)
router.delete('/profile/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Soft delete beállítása
    await db.run('UPDATE users SET is_deleted = 1 WHERE id = ? AND role = ?', [studentId, 'student']);

    // Aktív foglalások lekérdezése
    const activeBookings = await db.all(
      `SELECT b.id AS booking_id, b.lesson_id, l.teacher_id, l.lesson_date, l.start_time,
              s.name AS subject_name, st.name AS student_name
       FROM bookings b
       JOIN lessons l ON b.lesson_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       JOIN users st ON b.student_id = st.id
       WHERE b.student_id = ? AND b.status IN ('pending', 'approved')`,
      [studentId]
    );

    for (const item of activeBookings) {
      await db.run("UPDATE bookings SET status = 'cancelled_by_student' WHERE id = ?", [item.booking_id]);
      await db.run("UPDATE lessons SET status = 'free' WHERE id = ?", [item.lesson_id]);

      // Tanár értesítése
      const notifyMsg = `${item.student_name} törölte a profilját, így a foglalása törölve lett: ${item.subject_name} (${item.lesson_date} ${item.start_time}). Az óra felszabadult.`;
      await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [item.teacher_id, notifyMsg]);
    }

    res.json({ message: 'Profil sikeresen törölve (soft delete).' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
