const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Minden diak vegpont vedett (token + student szerepkor)
router.use(verifyToken, checkRole('student'));

// Szabad orak keresese
router.get('/lessons', studentController.getLessons);

// Ora lefoglalasa
router.post('/book', studentController.bookLesson);

// Diak sajat orai
router.get('/my-bookings', studentController.getMyBookings);

// Foglalas lemondasa
router.put('/bookings/:lessonId/cancel', studentController.cancelBooking);

// Diak profil soft delete
router.delete('/profile', studentController.deleteProfile);

module.exports = router;
