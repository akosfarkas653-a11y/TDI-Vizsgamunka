const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Diak regisztracio
router.post('/register', authController.register);

// Bejelentkezes (diak, tanar, admin)
router.post('/login', authController.login);

module.exports = router;
