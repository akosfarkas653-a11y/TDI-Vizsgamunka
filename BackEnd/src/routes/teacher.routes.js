const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Szabad időpont meghirdetése (tantárgy, dátum, kezdési és befejezési idő)
router.post('/lessons', async (req, res) => {
  try {
    const { teacher_id, subject_id, lesson_date, start_time, end_time } = req.body;
    if (!teacher_id || !subject_id || !lesson_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Minden mező kitöltése kötelező!' });
    }

    const result = await db.run(
      `INSERT INTO lessons (teacher_id, subject_id, lesson_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'free')`,
      [teacher_id, subject_id, lesson_date, start_time, end_time]
    );

    res.status(201).json({ message: 'Szabad időpont sikeresen meghirdetve', lessonId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Tanár saját meghirdetett óráinak lekérdezése
router.get('/lessons', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id paraméter kötelező!' });
    }

    const lessons = await db.all(
      `SELECT l.id, l.lesson_date, l.start_time, l.end_time, l.status,
              s.name AS subject_name
       FROM lessons l
       JOIN subjects s ON l.subject_id = s.id
       WHERE l.teacher_id = ?
       ORDER BY l.lesson_date ASC, l.start_time ASC`,
      [teacher_id]
    );

    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Dashboard: foglalások megtekintése (diák neve és email címe)
router.get('/bookings', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id paraméter kötelező!' });
    }

    const bookings = await db.all(
      `SELECT b.id AS booking_id, b.status AS booking_status, b.booked_at,
              l.id AS lesson_id, l.lesson_date, l.start_time, l.end_time,
              s.name AS subject_name,
              u.id AS student_id, u.name AS student_name, u.email AS student_email
       FROM bookings b
       JOIN lessons l ON b.lesson_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       JOIN users u ON b.student_id = u.id
       WHERE l.teacher_id = ?
       ORDER BY l.lesson_date ASC, l.start_time ASC`,
      [teacher_id]
    );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Foglalás jóváhagyása
router.put('/bookings/:id/approve', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Lekérjük a foglalás adatait
    const booking = await db.get(
      `SELECT b.lesson_id, b.student_id,
              l.lesson_date, l.start_time,
              s.name AS subject_name,
              t.name AS teacher_name
       FROM bookings b
       JOIN lessons l ON b.lesson_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       JOIN users t ON l.teacher_id = t.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Foglalás nem található!' });
    }

    // Jóváhagyás
    await db.run("UPDATE bookings SET status = 'approved' WHERE id = ?", [bookingId]);
    await db.run("UPDATE lessons SET status = 'approved' WHERE id = ?", [booking.lesson_id]);

    // Értesítés a diáknak
    const notifyMsg = `${booking.teacher_name} jóváhagyta a foglalásodat: ${booking.subject_name} (${booking.lesson_date} ${booking.start_time}).`;
    await db.run(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [booking.student_id, notifyMsg]
    );

    res.json({ message: 'Foglalás jóváhagyva, a diák értesítést kapott.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Óra törlése / lemondása a tanár részéről
// A foglaló diák értesítést kap, az óra 'cancelled' állapotot kap
router.put('/lessons/:id/cancel', async (req, res) => {
  try {
    const lessonId = req.params.id;

    const lesson = await db.get(
      `SELECT l.id, l.lesson_date, l.start_time,
              s.name AS subject_name,
              t.name AS teacher_name
       FROM lessons l
       JOIN subjects s ON l.subject_id = s.id
       JOIN users t ON l.teacher_id = t.id
       WHERE l.id = ?`,
      [lessonId]
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Az óra nem található!' });
    }

    // Óra lemondva állapotba helyezése
    await db.run("UPDATE lessons SET status = 'cancelled' WHERE id = ?", [lessonId]);

    // Érintett aktív foglalások lekérdezése
    const activeBookings = await db.all(
      "SELECT id, student_id FROM bookings WHERE lesson_id = ? AND status IN ('pending', 'approved')",
      [lessonId]
    );

    for (const b of activeBookings) {
      await db.run("UPDATE bookings SET status = 'cancelled_by_teacher' WHERE id = ?", [b.id]);

      // Diák értesítése (dátum, időpont, tantárgy, tanár neve)
      const notifyMsg = `${lesson.teacher_name} tanár úr/nő lemondta az órát: ${lesson.subject_name} (${lesson.lesson_date} ${lesson.start_time}).`;
      await db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [b.student_id, notifyMsg]);
    }

    res.json({ message: 'Óra lemondva, a diákok értesítést kaptak.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Kimutatás / Statisztika a tanár profiljáról
// Meghirdetett, szabad, függő, jóváhagyott és lemondott órák száma
router.get('/stats', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id paraméter kötelező!' });
    }

    const totalLessons = await db.get(
      'SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ?',
      [teacher_id]
    );
    const freeLessons = await db.get(
      "SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ? AND status = 'free'",
      [teacher_id]
    );
    const pendingLessons = await db.get(
      "SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ? AND status = 'pending'",
      [teacher_id]
    );
    const approvedLessons = await db.get(
      "SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ? AND status = 'approved'",
      [teacher_id]
    );
    const cancelledLessons = await db.get(
      "SELECT COUNT(*) as count FROM lessons WHERE teacher_id = ? AND status = 'cancelled'",
      [teacher_id]
    );

    res.json({
      total: totalLessons.count,
      free: freeLessons.count,
      pending: pendingLessons.count,
      approved: approvedLessons.count,
      cancelled: cancelledLessons.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
