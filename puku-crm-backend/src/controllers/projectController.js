const Project = require('../models/Project');
const { logActivity } = require('../utils/logger');

exports.getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { projects, total } = await Project.getPaginated(limit, offset);
        res.json({ success: true, projects, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const projectId = await Project.create(req.body);
        await logActivity(req, 'CREATED', 'Project', projectId, { name: req.body.name });
        res.status(201).json({ id: projectId, message: 'Project created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        await Project.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'Project', req.params.id, { name: req.body.name, status: req.body.status });
        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.delete(req.params.id);
        await logActivity(req, 'DELETED', 'Project', req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
