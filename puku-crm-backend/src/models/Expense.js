const pool = require('../config/db');

class Expense {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT e.*, ec.name as category_name, ec.color as category_color 
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.id DESC
    `);
    return rows;
  }

  static async getPaginated(limit, offset) {
    const [rows] = await pool.query(`
      SELECT e.*, ec.name as category_name, ec.color as category_color 
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM expenses');
    return { expenses: rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT e.*, ec.name as category_name, ec.color as category_color 
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(data) {
    const { category_id, amount, date, description, payment_method } = data;
    const [result] = await pool.query(
      'INSERT INTO expenses (category_id, amount, date, description, payment_method) VALUES (?, ?, ?, ?, ?)',
      [category_id, amount, date, description, payment_method]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { category_id, amount, date, description, payment_method } = data;
    await pool.query(
      'UPDATE expenses SET category_id = ?, amount = ?, date = ?, description = ?, payment_method = ? WHERE id = ?',
      [category_id, amount, date, description, payment_method, id]
    );
  }

  static async getMonthlySummary() {
    const [rows] = await pool.query(`
      SELECT 
        ec.id,
        ec.name,
        ec.color,
        COALESCE(SUM(e.amount), 0) as total
      FROM expense_categories ec
      LEFT JOIN expenses e ON ec.id = e.category_id 
        AND MONTH(e.date) = MONTH(CURRENT_DATE()) 
        AND YEAR(e.date) = YEAR(CURRENT_DATE())
      GROUP BY ec.id, ec.name, ec.color
    `);
    return rows;
  }

  static async delete(id) {
    await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
  }
}

module.exports = Expense;
