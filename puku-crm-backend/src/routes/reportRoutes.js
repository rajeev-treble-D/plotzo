const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/chat', reportController.generateAiReport);

module.exports = router;
