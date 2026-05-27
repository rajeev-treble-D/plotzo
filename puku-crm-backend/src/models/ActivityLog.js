const pool = require('../config/db');

class ActivityLog {
    static async create(data) {
        const { user_id, action, entity_type, entity_id, details } = data;
        await pool.query(
            'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            [user_id, action, entity_type, entity_id, typeof details === 'object' ? JSON.stringify(details) : details]
        );
    }

    static async getPaginated(limit, offset, filters = {}) {
        let baseQuery = `
      SELECT al.*, u.name as user_name,
      CASE 
        WHEN al.entity_type = 'User' THEN (SELECT name FROM users WHERE id = al.entity_id)
        WHEN al.entity_type = 'Customer' THEN (SELECT name FROM customers WHERE id = al.entity_id)
        ELSE NULL 
      END as entity_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
        const params = [];
        const whereClauses = [];

        if (filters.user_id) {
            whereClauses.push('al.user_id = ?');
            params.push(filters.user_id);
        }
        if (filters.action) {
            whereClauses.push('al.action = ?');
            params.push(filters.action);
        }
        if (filters.entity_type) {
            whereClauses.push('al.entity_type = ?');
            params.push(filters.entity_type);
        }

        let countQuery = 'SELECT COUNT(*) as total FROM activity_logs al';
        if (whereClauses.length > 0) {
            const wherePart = ' WHERE ' + whereClauses.join(' AND ');
            baseQuery += wherePart;
            countQuery += wherePart;
        }

        baseQuery += ' ORDER BY al.id DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query(baseQuery, params);
        const [[{ total }]] = await pool.query(countQuery, params.slice(0, whereClauses.length));

        return {
            logs: rows.map(row => {
                let details = row.details;
                if (details && typeof details === 'string' && (details.startsWith('{') || details.startsWith('['))) {
                    try {
                        details = JSON.parse(details);
                    } catch (e) {
                        // Keep as string if parsing fails
                    }
                }
                return { ...row, details };
            }),
            total
        };
    }

    static async findAll(filters = {}) {
        let query = `
      SELECT al.*, u.name as user_name,
      CASE 
        WHEN al.entity_type = 'User' THEN (SELECT name FROM users WHERE id = al.entity_id)
        WHEN al.entity_type = 'Customer' THEN (SELECT name FROM customers WHERE id = al.entity_id)
        ELSE NULL 
      END as entity_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
        const params = [];
        const whereClauses = [];

        if (filters.user_id) {
            whereClauses.push('al.user_id = ?');
            params.push(filters.user_id);
        }
        if (filters.action) {
            whereClauses.push('al.action = ?');
            params.push(filters.action);
        }
        if (filters.entity_type) {
            whereClauses.push('al.entity_type = ?');
            params.push(filters.entity_type);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY al.id DESC LIMIT ?';
        params.push(parseInt(filters.limit) || 100);

        const [rows] = await pool.query(query, params);

        return rows.map(row => {
            let details = row.details;
            if (typeof details === 'string' && (details.startsWith('{') || details.startsWith('['))) {
                try {
                    details = JSON.parse(details);
                } catch (e) {
                    // Keep as string
                }
            }
            return { ...row, details };
        });
    }
}

module.exports = ActivityLog;
