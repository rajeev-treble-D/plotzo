const express = require('express');
const router = express.Router();
const { getUsers, createUser, assignRole, updateUser, deleteUser } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('Admin'), getUsers);
router.post('/', auth, authorize('Admin'), createUser);
router.post('/assign-role', auth, authorize('Admin'), assignRole);
router.put('/:id', auth, authorize('Admin'), updateUser);
router.delete('/:id', auth, authorize('Admin'), deleteUser);

module.exports = router;
