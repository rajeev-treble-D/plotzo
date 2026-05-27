const pool = require('../config/db');

const optional = value => value === undefined ? null : value;

const Lead = {
    create: async (data) => {
        const { name, email, phone, source, propertyType, specificProperty, budget, preferredState, preferredCity, assignedTo, enquiryType, note} = data;
        const [result] = await pool.query(
            `INSERT INTO leads (name, email, phone, source, propertyType, specificProperty, budget, preferredState, preferredCity, assignedTo, enquiryType, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                optional(email),
                phone,
                source,
                propertyType,
                optional(specificProperty),
                optional(budget),
                optional(preferredState),
                optional(preferredCity),
                assignedTo,
                enquiryType || 'Tele',
                optional(note)
            ]
        );
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await pool.query('SELECT * FROM leads ORDER BY id DESC');
        return rows;
    },

    getPaginated: async (limit, offset) => {
        const [rows] = await pool.query(
            'SELECT * FROM leads ORDER BY id DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM leads');
        return { leads: rows, total };
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const { name, email, phone, source, propertyType, specificProperty, budget, preferredState, preferredCity, assignedTo, enquiryType, note } = data;
        const [result] = await pool.query(
            `UPDATE leads SET name = ?, email = ?, phone = ?, source = ?, propertyType = ?, specificProperty = ?, budget = ?, preferredState = ?, preferredCity = ?, assignedTo = ?, enquiryType = ?, note = ? 
       WHERE id = ?`,
            [
                name,
                optional(email),
                phone,
                source,
                propertyType,
                optional(specificProperty),
                optional(budget),
                optional(preferredState),
                optional(preferredCity),
                assignedTo,
                enquiryType || 'Tele',
                optional(note),
                id
            ]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM leads WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Lead;
