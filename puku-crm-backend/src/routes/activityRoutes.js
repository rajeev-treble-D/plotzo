const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

// Activity Log routes (Protected, Admin only)
router.get('/', auth, activityController.getActivityLogs);

module.exports = router;
