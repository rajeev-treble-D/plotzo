const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStates, getStateById, createState, updateState, deleteState } = require('../controllers/stateController');

// All state routes require authentication
router.use(auth);

router.get('/', getStates);
router.get('/:id', getStateById);
router.post('/', createState);
router.put('/:id', updateState);
router.delete('/:id', deleteState);

module.exports = router;

