const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

// Task management routes (Protected)
router.get('/', auth, taskController.getTasks);
router.get('/:id', auth, taskController.getTaskById);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.patch('/:id/status', auth, taskController.toggleTaskStatus);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
