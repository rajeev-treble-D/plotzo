const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logActivity } = require('../utils/logger');

exports.getStats = async (req, res) => {
    try {
        const [customerCount] = await pool.query('SELECT COUNT(*) as count FROM customers');
        const [saleStats] = await pool.query('SELECT SUM(amount) as total, COUNT(*) as count FROM sales WHERE status = "Completed"');
        const [expenseStats] = await pool.query('SELECT SUM(amount) as total FROM expenses');
        const [leadCount] = await pool.query('SELECT COUNT(*) as count FROM leads');
        const [stockCount] = await pool.query('SELECT SUM(quantity) as count, SUM(quantity * unit_price) as value FROM stock');
        const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects WHERE status = "In Progress"');
        const [taskCount] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status != "Completed"');

        // Sales today
        const [salesToday] = await pool.query('SELECT SUM(amount) as total FROM sales WHERE DATE(transaction_date) = CURDATE() AND status = "Completed"');

        // Expenses today
        const [expensesToday] = await pool.query('SELECT SUM(amount) as total FROM expenses WHERE DATE(date) = CURDATE()');

        res.json({
            customers: Number(customerCount[0].count),
            totalSales: Number(saleStats[0].total) || 0,
            salesToday: Number(salesToday[0].total) || 0,
            totalExpenses: Number(expenseStats[0].total) || 0,
            expensesToday: Number(expensesToday[0].total) || 0,
            activeLeads: Number(leadCount[0].count),
            stockQuantity: Number(stockCount[0].count) || 0,
            stockValue: Number(stockCount[0].value) || 0,
            activeProjects: Number(projectCount[0].count),
            pendingTasks: Number(taskCount[0].count),
            netEarnings: (Number(saleStats[0].total) || 0) - (Number(expenseStats[0].total) || 0)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getChartData = async (req, res) => {
    try {
        // Generate last 30 days labels
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                dateStr: date.toISOString().slice(0, 10) // YYYY-MM-DD
            });
        }

        // Get sales for last 30 days
        const [salesData] = await pool.query(`
            SELECT 
                DATE(transaction_date) as dateStr,
                SUM(amount) as total
            FROM sales
            WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            AND status = "Completed"
            GROUP BY dateStr
        `);

        // Get expenses for last 30 days
        const [expenseData] = await pool.query(`
            SELECT 
                DATE(date) as dateStr,
                SUM(amount) as total
            FROM expenses
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY dateStr
        `);

        // Map data to days
        const result = days.map(d => {
            const sale = salesData.find(s => {
                const sDate = new Date(s.dateStr).toISOString().slice(0, 10);
                return sDate === d.dateStr;
            });
            const expense = expenseData.find(e => {
                const eDate = new Date(e.dateStr).toISOString().slice(0, 10);
                return eDate === d.dateStr;
            });
            return {
                label: d.label,
                sales: Number(sale ? sale.total : 0),
                expenses: Number(expense ? expense.total : 0)
            };
        });

        // Get project status counts
        const [projectData] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM projects 
            GROUP BY status
        `);

        // Get task workload by user
        const [taskData] = await pool.query(`
            SELECT u.name as user_name, t.status, COUNT(*) as count
            FROM tasks t
            JOIN users u ON t.user_id = u.id
            GROUP BY u.name, t.status
        `);

        res.json({
            incomeExpense: result,
            projectStatus: projectData,
            taskWorkload: taskData
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.generateAiReport = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        await logActivity(req, 'GENERATED', 'AiReport', null, { prompt });

        res.json({
            success: true,
            report: responseText
        });
    } catch (err) {
        console.error("Error generating AI report:", err);
        res.status(500).json({ message: "Failed to generate AI report", error: err.message });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const [activities] = await pool.query(`
            SELECT al.*, u.name as user_name
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 5
        `);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.clearActivityLogs = async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE activity_logs');
        await logActivity(req, 'CLEARED', 'ActivityLogs', null, 'All activity logs were truncated.');
        res.json({ success: true, message: 'Activity logs cleared successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
