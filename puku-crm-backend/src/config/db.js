const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../../.env' });

let pool;

const createPool = () => {
    console.log(process.env.DB_USER, process.env.DB_HOST, process.env.DB_NAME);
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

pool = createPool();

// Export a proxy that always uses the current pool
// This allows us to refresh the pool without breaking references in models
const handler = {
    get: (target, prop) => {
        if (prop === 'refreshPool') {
            return async () => {
                const oldPool = pool;
                pool = createPool();
                await oldPool.end();
            };
        }
        return pool[prop];
    }
};

module.exports = new Proxy({}, handler);
