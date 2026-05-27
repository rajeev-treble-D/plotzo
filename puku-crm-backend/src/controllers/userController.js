const User = require('../models/User');
const { logActivity } = require('../utils/logger');

const getUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role_id } = req.body;
        const userId = await User.create({ name, email, password, role_id });
        await logActivity(req, 'CREATED', 'User', userId, { name, email });
        res.status(201).json({ success: true, message: 'User created successfully', userId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const assignRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        const pool = require('../config/db');

        // Fetch user and role names for better logging
        const [[user]] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
        const [[role]] = await pool.execute('SELECT name FROM roles WHERE id = ?', [roleId]);

        await pool.execute(
            'UPDATE users SET role_id = ? WHERE id = ?',
            [roleId, userId]
        );

        await logActivity(req, 'ROLE_ASSIGNED', 'User', userId, {
            role_id: roleId,
            role_name: role?.name,
            user_name: user?.name
        });

        res.json({ success: true, message: 'Role assigned successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role_id, status } = req.body;

        await User.update(id, { name, email, role_id, status });
        await logActivity(req, 'UPDATED', 'User', id, { name, role_id, status });
        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        await logActivity(req, 'DELETED', 'User', id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getUsers, createUser, assignRole, updateUser, deleteUser };
