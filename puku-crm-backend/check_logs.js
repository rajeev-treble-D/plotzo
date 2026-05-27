const pool = require('./src/config/db');
async function checkLogs() {
    try {
        const [rows] = await pool.query('SELECT * FROM activity_logs LIMIT 10');
        console.log('Logs found:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
checkLogs();
