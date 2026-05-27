const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

// Check installation status
router.get('/status', setupController.getStatus);

// Step 1: Check database connection and write .env
router.post('/check-db', setupController.checkDatabase);

// Step 2: Initialize database (create tables)
router.post('/install', setupController.install);

// Step 3: Create initial admin
router.post('/create-admin', setupController.createAdmin);

module.exports = router;
