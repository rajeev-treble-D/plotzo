const pool = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logActivity } = require('../utils/logger');

exports.generateAiReport = async (req, res) => {
    const { prompt } = req.body;

    try {
        // 1. Get Gemini API Key from settings
        const [settings] = await pool.query('SELECT key_value FROM settings WHERE key_name = "gemini_api_key"');
        const apiKey = settings[0]?.key_value;

        if (!apiKey || apiKey.trim() === "") {
            return res.status(400).json({
                success: false,
                message: 'Gemini API Key is not configured. Please add it in Settings.'
            });
        }

        const trimmedApiKey = apiKey.trim().replace(/^["']|["']$/g, '');

        // 2. Fetch all relevant data for context
        const [sales] = await pool.query(`
            SELECT s.*, c.name as customer_name
            FROM sales s
            LEFT JOIN customers c ON s.customer_id = c.id
        `);
        const [expenses] = await pool.query(`
            SELECT e.*, ec.name as category_name
            FROM expenses e
            LEFT JOIN expense_categories ec ON e.category_id = ec.id
        `);
        const [customers] = await pool.query('SELECT * FROM customers');
        const [leads] = await pool.query('SELECT * FROM leads');

        const contextData = {
            sales: sales.map(s => ({ date: s.transaction_date, amount: s.amount, customer: s.customer_name, status: s.status, description: s.description })),
            expenses: expenses.map(e => ({ date: e.date, amount: e.amount, category: e.category_name, description: e.description })),
            customers: customers.map(c => ({ name: c.name, email: c.email, company: c.company, status: c.status })),
            leads: leads.map(l => ({ name: l.name, opportunity: l.opportunity, valuation: l.valuation, stage: l.stage }))
        };

        // 3. Initialize Gemini
        const genAI = new GoogleGenerativeAI(trimmedApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const fullPrompt = `
            You are a senior business analyst for a CRM system.
            Below is the current data from the CRM database:

            SALES: ${JSON.stringify(contextData.sales)}
            EXPENSES: ${JSON.stringify(contextData.expenses)}
            CUSTOMERS: ${JSON.stringify(contextData.customers)}
            LEADS: ${JSON.stringify(contextData.leads)}
            
            Current Date: ${new Date().toISOString().split('T')[0]}
            
            User Query: "${prompt}"
            
            Please analyze the data and provide a detailed report or answer the query.
            Format your response in professional Markdown.
            If the query asks for calculations (like total sales), perform them accurately.
            If there is no specific data for the query, mention that.
            Always highlight key insights like trending products, top customers, or areas for cost-saving.
        `;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        await logActivity(req, 'GENERATED', 'AiReport', null, { prompt });

        res.json({
            success: true,
            report: responseText
        });

    } catch (err) {
        console.error('Gemini Error:', err);
        res.status(500).json({
            success: false,
            message: 'Error generating AI report: ' + err.message
        });
    }
};
