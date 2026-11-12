const studentService = require('../services/student.service');

// Szabad orak lekerdezese
const getLessons = async (req, res) => {
  try {
    const { teacher, subject } = req.query;
    const lessons = await studentService.getFreeLessons({ teacher, subject });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ora lefoglalasa
const bookLesson = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { lessonId } = req.body;
    const lesson = await studentService.bookLesson(studentId, lessonId);
    res.status(201).json({ message: 'Ora sikeresen lefoglalva!', lesson });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Sajat orak / foglalasok lekerdezese
const getMyBookings = async (req, res) => {
  try {
    const studentId = req.user.id;
    const bookings = await studentService.getMyBookings(studentId);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Foglalas lemondasa
const cancelBooking = async (req, res) => {
  try {
    const studentId = req.user.id;
    const lessonId = req.params.lessonId;
    const result = await studentService.cancelBooking(studentId, lessonId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Diak profil soft delete
const deleteProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await studentService.deleteProfile(studentId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getLessons,
  bookLesson,
  getMyBookings,
  cancelBooking,
  deleteProfile
};

