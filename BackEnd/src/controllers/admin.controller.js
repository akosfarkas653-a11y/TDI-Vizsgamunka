const adminService = require('../services/admin.service');

// Tanar letrehozasa
const createTeacher = async (req, res) => {
  try {
    const teacher = await adminService.createTeacher(req.body);
    res.status(201).json({ message: 'Tanar sikeresen letrehozva!', teacher });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Tanarok listazasa
const getTeachers = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const teachers = await adminService.getTeachers(includeDeleted);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Diakok listazasa
const getStudents = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const students = await adminService.getStudents(includeDeleted);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Osszes foglalt ora listazasa
const getLessons = async (req, res) => {
  try {
    const lessons = await adminService.getBookedLessons();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tanar attekintes (overview)
const getTeacherOverview = async (req, res) => {
  try {
    const overview = await adminService.getTeacherOverview(req.params.id);
    res.json(overview);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Diak attekintes (overview)
const getStudentOverview = async (req, res) => {
  try {
    const overview = await adminService.getStudentOverview(req.params.id);
    res.json(overview);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Tanar soft delete
const deleteTeacher = async (req, res) => {
  try {
    const result = await adminService.deleteTeacher(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Diak soft delete
const deleteStudent = async (req, res) => {
  try {
    const result = await adminService.deleteStudent(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getStudents,
  getLessons,
  getTeacherOverview,
  getStudentOverview,
  deleteTeacher,
  deleteStudent
};

