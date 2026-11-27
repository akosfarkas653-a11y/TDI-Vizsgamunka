const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Nyitolapi publikus vegpont (nem igenyel tokent)
router.get('/filters', publicController.getFilters);

module.exports = router;
