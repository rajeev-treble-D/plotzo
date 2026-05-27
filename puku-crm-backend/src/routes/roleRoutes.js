const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getRoles);
router.post('/', auth, authorize('Admin'), createRole);
router.put('/:id', auth, authorize('Admin'), updateRole);
router.delete('/:id', auth, authorize('Admin'), deleteRole);

module.exports = router;
