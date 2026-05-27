const Sale = require('../models/Sale');
const { logActivity } = require('../utils/logger');

exports.getSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { sales, total } = await Sale.getPaginated(limit, offset);
        res.json({ success: true, sales, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSale = async (req, res) => {
    try {
        const saleId = await Sale.create(req.body);
        await logActivity(req, 'CREATED', 'Sale', saleId, { amount: req.body.amount, customer_name: req.body.customer_name });
        res.status(201).json({ id: saleId, message: 'Sale created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateSale = async (req, res) => {
    try {
        await Sale.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'Sale', req.params.id, { amount: req.body.amount, status: req.body.status });
        res.json({ message: 'Sale updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        await Sale.delete(req.params.id);
        await logActivity(req, 'DELETED', 'Sale', req.params.id);
        res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
