const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Minden tanar vegpont vedett (token + teacher szerepkor)
router.use(verifyToken, checkRole('teacher'));

// Uj ora letrehozasa
router.post('/lessons', teacherController.createLesson);

// Tanar orainak lekerdezese
router.get('/lessons', teacherController.getLessons);

// Foglalt ora jovahagyasa
router.put('/lessons/:id/approve', teacherController.approveLesson);

// Ora lemondasa
router.put('/lessons/:id/cancel', teacherController.cancelLesson);

// Tanari statisztika
router.get('/stats', teacherController.getStats);

module.exports = router;
