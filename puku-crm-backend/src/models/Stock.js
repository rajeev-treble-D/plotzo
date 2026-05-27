const pool = require('../config/db');

class Stock {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM stock ORDER BY id DESC');
        return rows;
    }

    static async getPaginated(limit, offset) {
        const [rows] = await pool.query(
            'SELECT * FROM stock ORDER BY id DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM stock');
        return { items: rows, total };
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM stock WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, category, sku, quantity, unit_price, description } = data;
        const [result] = await pool.query(
            'INSERT INTO stock (name, category, sku, quantity, unit_price, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, sku, quantity, unit_price, description]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { name, category, sku, quantity, unit_price, description } = data;
        await pool.query(
            'UPDATE stock SET name = ?, category = ?, sku = ?, quantity = ?, unit_price = ?, description = ? WHERE id = ?',
            [name, category, sku, quantity, unit_price, description, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM stock WHERE id = ?', [id]);
    }

    static async getCategories() {
        const [rows] = await pool.query('SELECT name FROM stock_categories ORDER BY name ASC');
        return rows.map(row => row.name);
    }
}

module.exports = Stock;
