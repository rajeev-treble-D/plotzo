const Role = require('../models/Role');
const { logActivity } = require('../utils/logger');

const getRoles = async (req, res) => {
    try {
        const roles = await Role.getAll();
        res.json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const roleId = await Role.create({ name, description, permissions });
        await logActivity(req, 'CREATED', 'Role', roleId, { name });
        res.status(201).json({ success: true, message: 'Role created successfully', roleId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;
        await Role.update(id, { name, description, permissions });
        await logActivity(req, 'UPDATED', 'Role', id, { name });
        res.json({ success: true, message: 'Role updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await Role.delete(id);
        await logActivity(req, 'DELETED', 'Role', id);
        res.json({ success: true, message: 'Role deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getRoles, createRole, updateRole, deleteRole };
