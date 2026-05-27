const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getStats);
router.get('/charts', auth, dashboardController.getChartData);
router.get('/activity', auth, dashboardController.getRecentActivity);
router.delete('/activity/clear', auth, authorize('Admin'), dashboardController.clearActivityLogs);

module.exports = router;
