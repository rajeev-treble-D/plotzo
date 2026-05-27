const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class Customer {
    static async getAll() {
        const [rows] = await pool.execute(
            'SELECT id, name, email, phone, company, status, address, city, country, last_login, created_at FROM customers ORDER BY id DESC'
        );
        return rows;
    }

    static async getPaginated(limit, offset) {
        const [rows] = await pool.execute(
            'SELECT id, name, email, phone, company, status, address, city, country, last_login, created_at FROM customers ORDER BY id DESC LIMIT ? OFFSET ?',
            [String(limit), String(offset)]
        );
        const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM customers');
        return { customers: rows, total };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async create({ name, email, password, phone, company, status, address, city, country }) {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const [result] = await pool.execute(
            'INSERT INTO customers (name, email, password, phone, company, status, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, company, status || 'Active', address, city, country]
        );
        return result.insertId;
    }

    static async update(id, { name, email, phone, company, status, address, city, country }) {
        await pool.execute(
            'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, status = ?, address = ?, city = ?, country = ? WHERE id = ?',
            [name, email, phone, company, status, address, city, country, id]
        );
        return true;
    }

    static async delete(id) {
        await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
        return true;
    }

    static async getDetails(id) {
        const [customer] = await pool.execute(
            'SELECT id, name, email, phone, company, status, address, city, country, last_login, created_at FROM customers WHERE id = ?',
            [id]
        );

        if (!customer[0]) return null;

        const [sales] = await pool.execute(
            'SELECT * FROM sales WHERE customer_id = ? ORDER BY id DESC',
            [id]
        );

        const [projects] = await pool.execute(
            'SELECT * FROM projects WHERE client_id = ? ORDER BY id DESC',
            [id]
        );

        return {
            ...customer[0],
            sales,
            projects
        };
    }

    static async search(query) {
        const sqlQuery = `
            SELECT id, name, email, company, status 
            FROM customers 
            WHERE name LIKE ? 
            OR email LIKE ? 
            OR company LIKE ? 
            LIMIT 5
        `;
        const searchTerm = `%${query}%`;
        const [rows] = await pool.execute(sqlQuery, [searchTerm, searchTerm, searchTerm]);
        return rows;
    }
}

module.exports = Customer;
