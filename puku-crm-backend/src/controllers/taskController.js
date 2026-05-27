const Task = require('../models/Task');
const { logActivity } = require('../utils/logger');

exports.getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { tasks, total } = await Task.getPaginated(limit, offset);
        res.json({ success: true, tasks, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const taskId = await Task.create(req.body);
        await logActivity(req, 'CREATED', 'Task', taskId, { title: req.body.title });
        res.status(201).json({ id: taskId, message: 'Task created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        await Task.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'Task', req.params.id, { title: req.body.title });
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.toggleTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await Task.updateStatus(req.params.id, status);
        await logActivity(req, 'STATUS_TOGGLE', 'Task', req.params.id, { status });
        res.json({ message: `Task marked as ${status}` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Task.delete(req.params.id);
        await logActivity(req, 'DELETED', 'Task', req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
