const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Diák regisztráció
router.post('/register', authController.registerStudent);

// Bejelentkezés (diák, tanár, admin)
router.post('/login', authController.login);

module.exports = router;
