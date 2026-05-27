const pool = require('../config/db');

class Task {
    static async findAll() {
        const [rows] = await pool.query(`
      SELECT t.*, u.name as assigned_name 
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
        return rows;
    }

    static async getPaginated(limit, offset) {
        const [rows] = await pool.query(`
      SELECT t.*, u.name as assigned_name 
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM tasks');
        return { tasks: rows, total };
    }

    static async findById(id) {
        const [rows] = await pool.query(`
      SELECT t.*, u.name as assigned_name 
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { title, description, status, priority, due_date, user_id } = data;
        const [result] = await pool.query(
            'INSERT INTO tasks (title, description, status, priority, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, status, priority, due_date, user_id]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { title, description, status, priority, due_date, user_id } = data;
        await pool.query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, user_id = ? WHERE id = ?',
            [title, description, status, priority, due_date, user_id, id]
        );
    }

    static async updateStatus(id, status) {
        await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    }

    static async delete(id) {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    }
}

module.exports = Task;
