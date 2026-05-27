const pool = require('../config/db');

class Role {
    static async getAll() {
        const [rows] = await pool.execute(`
            SELECT r.*, COUNT(u.id) as member_count 
            FROM roles r 
            LEFT JOIN users u ON r.id = u.role_id 
            GROUP BY r.id
        `);
        return rows.map(row => ({
            ...row,
            permissions: typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
        }));
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [id]);
        if (rows[0]) {
            rows[0].permissions = typeof rows[0].permissions === 'string' ? JSON.parse(rows[0].permissions) : rows[0].permissions;
        }
        return rows[0];
    }

    static async create({ name, description, permissions }) {
        const [result] = await pool.execute(
            'INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)',
            [name, description, JSON.stringify(permissions || [])]
        );
        return result.insertId;
    }

    static async update(id, { name, description, permissions }) {
        await pool.execute(
            'UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?',
            [name, description, JSON.stringify(permissions || []), id]
        );
        return true;
    }

    static async delete(id) {
        await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
        return true;
    }
}

module.exports = Role;
