const pool = require('../config/db');

class Sale {
    static async findAll() {
        const [rows] = await pool.query(`
      SELECT s.*, c.name as customer_name, u.name as agent_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
    `);
        return rows;
    }

    static async getPaginated(limit, offset) {
        const [rows] = await pool.query(`
      SELECT s.*, c.name as customer_name, u.name as agent_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM sales');
        return { sales: rows, total };
    }

    static async findById(id) {
        const [rows] = await pool.query(`
      SELECT s.*, c.name as customer_name, u.name as agent_name 
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [id]);
        return rows[0];
    }

    static async create(data) {
        const { customer_id, user_id, amount, status, payment_method, description } = data;
        const [result] = await pool.query(
            'INSERT INTO sales (customer_id, user_id, amount, status, payment_method, description) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, user_id, amount, status, payment_method, description]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { customer_id, user_id, amount, status, payment_method, description } = data;
        await pool.query(
            'UPDATE sales SET customer_id = ?, user_id = ?, amount = ?, status = ?, payment_method = ?, description = ? WHERE id = ?',
            [customer_id, user_id, amount, status, payment_method, description, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    }
}

module.exports = Sale;
