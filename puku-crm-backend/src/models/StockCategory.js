const pool = require('../config/db');

class StockCategory {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM stock_categories ORDER BY name ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM stock_categories WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(name, description, color) {
        const [result] = await pool.query(
            'INSERT INTO stock_categories (name, description, color) VALUES (?, ?, ?)',
            [name, description, color || '#3b82f6']
        );
        return result.insertId;
    }

    static async update(id, name, description, color) {
        await pool.query(
            'UPDATE stock_categories SET name = ?, description = ?, color = ? WHERE id = ?',
            [name, description, color, id]
        );
        return true;
    }

    static async delete(id) {
        await pool.query('DELETE FROM stock_categories WHERE id = ?', [id]);
        return true;
    }
}

module.exports = StockCategory;
