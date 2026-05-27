const Customer = require('../models/Customer');
const { logActivity } = require('../utils/logger');

const getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { customers, total } = await Customer.getPaginated(limit, offset);
        res.json({ success: true, customers, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createCustomer = async (req, res) => {
    try {
        const { name, email, password, phone, company, status, address, city, country } = req.body;

        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and Email are required' });
        }

        const existing = await Customer.findByEmail(email);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
        }

        const customerId = await Customer.create({
            name, email, password, phone, company, status, address, city, country
        });

        await logActivity(req, 'CREATED', 'Customer', customerId, { name, company });

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            customerId
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, company, status, address, city, country } = req.body;

        await Customer.update(id, { name, email, phone, company, status, address, city, country });

        await logActivity(req, 'UPDATED', 'Customer', id, { name, company, status });

        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await Customer.delete(id);
        await logActivity(req, 'DELETED', 'Customer', id);
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const details = await Customer.getDetails(id);
        if (!details) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, ...details });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const searchCustomers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, customers: [] });
        }
        const customers = await Customer.search(q);
        res.json({ success: true, customers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerDetails,
    searchCustomers
};
