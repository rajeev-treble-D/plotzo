const pool = require('../config/db');

class Project {
    static async findAll() {
        const [rows] = await pool.query(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN customers c ON p.client_id = c.id
      ORDER BY p.id DESC
    `);
        return rows;
    }

    static async getPaginated(limit, offset) {
        const [rows] = await pool.query(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN customers c ON p.client_id = c.id
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM projects');
        return { projects: rows, total };
    }

    static async findById(id) {
        const [rows] = await pool.query(`
      SELECT p.*, c.name as client_name 
      FROM projects p
      LEFT JOIN customers c ON p.client_id = c.id
      WHERE p.id = ?
    `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description, status, client_id, budget, start_date, end_date } = data;
        const [result] = await pool.query(
            'INSERT INTO projects (name, description, status, client_id, budget, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, status, client_id, budget, start_date, end_date]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, description, status, client_id, budget, start_date, end_date } = data;
        await pool.query(
            'UPDATE projects SET name = ?, description = ?, status = ?, client_id = ?, budget = ?, start_date = ?, end_date = ? WHERE id = ?',
            [name, description, status, client_id, budget, start_date, end_date, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    }
}

module.exports = Project;
