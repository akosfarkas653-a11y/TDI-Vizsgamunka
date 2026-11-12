const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Vedett vegpontok diakok es tanarok reszere
router.use(verifyToken, checkRole('student', 'teacher'));

// Sajat ertesitesek lekerdezese
router.get('/', notificationController.getNotifications);

// Ertesites olvasottnak jelolese
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
