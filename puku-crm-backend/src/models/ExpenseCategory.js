const pool = require('../config/db');

class ExpenseCategory {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM expense_categories ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM expense_categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, description, color } = data;
        const [result] = await pool.query(
            'INSERT INTO expense_categories (name, description, color) VALUES (?, ?, ?)',
            [name, description, color]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, description, color } = data;
        await pool.query(
            'UPDATE expense_categories SET name = ?, description = ?, color = ? WHERE id = ?',
            [name, description, color, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM expense_categories WHERE id = ?', [id]);
    }
}

module.exports = ExpenseCategory;
