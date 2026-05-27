const pool = require('../config/db');
const { logActivity } = require('../utils/logger');

exports.getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT key_name, key_value FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.key_name] = row.key_value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    const settings = req.body; // Expecting { key_name: key_value }
    try {
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?',
                [key, value, value]
            );
        }
        await logActivity(req, 'UPDATED', 'Settings', null, { keys: Object.keys(settings) });
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Settings Update Error:', err);
        res.status(500).json({ message: err.message });
    }
};
