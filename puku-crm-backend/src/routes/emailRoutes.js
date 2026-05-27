const express = require('express');
const router = express.Router();
const { sendCustomEmail } = require('../controllers/emailController');
const { auth, authorize } = require('../middleware/auth');

router.post('/send', auth, authorize('Admin', 'Manager'), sendCustomEmail);

module.exports = router;
