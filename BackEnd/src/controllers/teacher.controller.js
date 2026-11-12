const teacherService = require('../services/teacher.service');

// Uj ora meghirdetese
const createLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const lesson = await teacherService.createLesson(teacherId, req.body);
    res.status(201).json({ message: 'Ora sikeresen meghirdetve!', lesson });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Tanar orainak lekerdezese
const getLessons = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const lessons = await teacherService.getLessons(teacherId);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Foglalt ora jovahagyasa
const approveLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const lessonId = req.params.id;
    const lesson = await teacherService.approveLesson(teacherId, lessonId);
    res.json({ message: 'Ora sikeresen jovahagyva!', lesson });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Ora lemondasa
const cancelLesson = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const lessonId = req.params.id;
    const result = await teacherService.cancelLesson(teacherId, lessonId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Statisztika lekerdezese
const getStats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const stats = await teacherService.getStats(teacherId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createLesson,
  getLessons,
  approveLesson,
  cancelLesson,
  getStats
};

