const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Minden admin vegpont vedett (token + admin szerepkor)
router.use(verifyToken, checkRole('admin'));

// Tanar fiok letrehozasa
router.post('/teachers', adminController.createTeacher);

// Tanarok es diakok listazasa
router.get('/teachers', adminController.getTeachers);
router.get('/students', adminController.getStudents);

// Foglalt orak listazasa
router.get('/lessons', adminController.getLessons);

// Reszletes statisztika es orak egy tanarra vagy diakra
router.get('/teachers/:id/overview', adminController.getTeacherOverview);
router.get('/students/:id/overview', adminController.getStudentOverview);

// Felhasznalok inaktivalasa (soft delete)
router.delete('/teachers/:id', adminController.deleteTeacher);
router.delete('/students/:id', adminController.deleteStudent);

module.exports = router;
