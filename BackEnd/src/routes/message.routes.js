const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Vedett vegpontok diakok es tanarok reszere
router.use(verifyToken, checkRole('student', 'teacher'));

// Uzenet kuldese
router.post('/', messageController.sendMessage);

// Beszelgetesfolyam lekerdezese orahoz
router.get('/lesson/:lessonId', messageController.getThread);

module.exports = router;
