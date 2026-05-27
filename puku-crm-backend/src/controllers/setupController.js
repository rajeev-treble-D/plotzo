const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const LOCK_FILE = path.join(__dirname, '../../installed.lock');
const ENV_FILE = path.join(__dirname, '../../.env');

exports.getStatus = async (req, res) => {
    try {
        const isInstalled = fs.existsSync(LOCK_FILE);
        res.json({ success: true, installed: isInstalled });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.checkDatabase = async (req, res) => {
    const { host, user, password, database } = req.body;

    try {
        const connection = await mysql.createConnection({ host, user, password, database });
        await connection.end();

        // If successful, write/update .env file
        let envContent = `DB_HOST=${host}\nDB_USER=${user}\nDB_PASS=${password}\nDB_NAME=${database}\n`;
        envContent += `PORT=5000\nJWT_SECRET=pukucrm_secret_key_${Math.random().toString(36).substring(7)}\nJWT_EXPIRE=30d\n`;

        fs.writeFileSync(ENV_FILE, envContent);

        // Reload process.env (basic reload for current process)
        process.env.DB_HOST = host;
        process.env.DB_USER = user;
        process.env.DB_PASS = password;
        process.env.DB_NAME = database;

        // Explicitly refresh the pool with the new process.env values
        const pool = require('../config/db');
        if (pool.refreshPool) {
            await pool.refreshPool();
        }

        res.json({ success: true, message: 'Database connection successful and configuration saved.' });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Database connection failed: ' + err.message });
    }
};

exports.install = async (req, res) => {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            return res.status(403).json({ success: false, message: 'System already installed.' });
        }

        // Force reload .env from file
        const dotenv = require('dotenv');
        dotenv.config({ path: ENV_FILE, override: true });

        // Refresh the pool to pick up the reloaded .env values
        const pool = require('../config/db');
        if (pool.refreshPool) {
            await pool.refreshPool();
        }

        // Create a fresh connection specifically for installation to avoid pool issues
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const initDB = require('../dbInit');
        await initDB(connection);
        await connection.end();

        res.json({ success: true, message: 'Database tables initialized successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Installation failed: ' + err.message });
    }
};

exports.createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (fs.existsSync(LOCK_FILE)) {
            return res.status(403).json({ success: false, message: 'System already installed.' });
        }

        // Ensure fresh pool
        const pool = require('../config/db');
        if (pool.refreshPool) {
            await pool.refreshPool();
        }
        const [adminRole] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");

        if (!adminRole.length) {
            return res.status(500).json({ success: false, message: 'Roles not initialized correctly.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role_id, status) VALUES (?, ?, ?, ?, "Active")',
            [name, email, hashedPassword, adminRole[0].id]
        );

        // Create lock file
        fs.writeFileSync(LOCK_FILE, `Installed on ${new Date().toISOString()}`);

        res.json({ success: true, message: 'Admin user created and installation finalized!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create admin: ' + err.message });
    }
};
