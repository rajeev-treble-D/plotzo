const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const initDB = require('./dbInit');

const app = express();

// Initialize Database if installed
const LOCK_FILE = path.join(__dirname, '../installed.lock');
if (fs.existsSync(LOCK_FILE)) {
    initDB().catch(err => {
        console.warn('Database initialization failed at startup. System might be unconfigured or DB is down.');
        console.error(err.message);
    });
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/stock', require('./routes/stockRoutes'));
app.use('/api/stock-categories', require('./routes/stockCategoryRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/report', require('./routes/reportRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Puku CRM API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
