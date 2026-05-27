const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { auth } = require('../middleware/auth');

// Secure all Lead routes with auth to enable activity logging
router.get('/', auth, leadController.getLeads);
router.get('/:id', auth, leadController.getLeadById);
router.post('/', auth, leadController.createLead);
router.put('/:id', auth, leadController.updateLead);
router.delete('/:id', auth, leadController.deleteLead);

module.exports = router;
