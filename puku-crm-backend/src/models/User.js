const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create({ name, email, password, role_id }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role_id]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT u.*, r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
            [email]
        );
        if (rows[0]) {
            rows[0].permissions = typeof rows[0].permissions === 'string' ? JSON.parse(rows[0].permissions) : rows[0].permissions;
        }
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT u.id, u.name, u.email, u.status, u.role_id, r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
            [id]
        );
        if (rows[0]) {
            rows[0].permissions = typeof rows[0].permissions === 'string' ? JSON.parse(rows[0].permissions) : rows[0].permissions;
        }
        return rows[0];
    }

    static async getAll() {
        const [rows] = await pool.execute(
            `SELECT u.id, u.name, u.email, u.status, u.role_id, r.name as role_name, r.permissions, u.last_login, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id`
        );
        return rows.map(row => ({
            ...row,
            permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
        }));
    }

    static async update(id, { name, email, role_id, status }) {
        await pool.execute(
            'UPDATE users SET name = ?, email = ?, role_id = ?, status = ? WHERE id = ?',
            [name, email, role_id, status, id]
        );
        return true;
    }

    static async updateLastLogin(id) {
        await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
        return true;
    }

    static async delete(id) {
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
        return true;
    }

    static async updateProfile(id, { name, email, password }) {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.execute(
                'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
                [name, email, hashedPassword, id]
            );
        } else {
            await pool.execute(
                'UPDATE users SET name = ?, email = ? WHERE id = ?',
                [name, email, id]
            );
        }
        return true;
    }

    static async verifyPassword(inputPassword, hashedPassword) {
        return await bcrypt.compare(inputPassword, hashedPassword);
    }

    static async setResetToken(email, token, expires) {
        await pool.execute(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
            [token, expires, email]
        );
        return true;
    }

    static async findByResetToken(token) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()`,
            [token]
        );
        return rows[0];
    }

    static async updatePassword(id, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(
            'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
            [hashedPassword, id]
        );
        return true;
    }
}

module.exports = User;
