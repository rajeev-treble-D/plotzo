const pool = require('../config/db');

class FollowUp {
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                u.name AS created_by_name
            FROM followups f
            LEFT JOIN users u ON f.created_by = u.id
            ORDER BY f.id DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                u.name AS created_by_name
            FROM followups f
            LEFT JOIN users u ON f.created_by = u.id
            WHERE f.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByLeadId(lead_id) {
        const [rows] = await pool.query(`
            SELECT
                f.*,
                u.name AS created_by_name
            FROM followups f
            LEFT JOIN users u ON f.created_by = u.id
            WHERE f.lead_id = ?
            ORDER BY f.id DESC
        `, [lead_id]);
        return rows;
    }

    static async create(data) {
        const { lead_id, disposition, meta, created_by } = data;
        const [result] = await pool.query(
            'INSERT INTO followups (lead_id, disposition, meta, created_by) VALUES (?, ?, ?, ?)',
            [lead_id, disposition, meta ? JSON.stringify(meta) : null, created_by]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { lead_id, disposition, meta, created_by } = data;
        const [result] = await pool.query(
            'UPDATE followups SET lead_id = ?, disposition = ?, meta = ?, created_by = ? WHERE id = ?',
            [lead_id, disposition, meta ? JSON.stringify(meta) : null, created_by, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM followups WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = FollowUp;
