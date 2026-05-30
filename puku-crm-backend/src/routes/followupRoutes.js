const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');
const { auth } = require('../middleware/auth');

router.get('/', auth, followupController.getAllFollowUps);
router.get('/:id', auth, followupController.getFollowUpById);
router.get('/lead/:lead_id', auth, followupController.getFollowUpsByLeadId);
router.post('/', auth, followupController.createFollowUp);
router.put('/:id', auth, followupController.updateFollowUp);
router.delete('/:id', auth, followupController.deleteFollowUp);

module.exports = router;
