const Stock = require('../models/Stock');
const { logActivity } = require('../utils/logger');

exports.getInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { items, total } = await Stock.getPaginated(limit, offset);
        res.json({ success: true, inventory: items, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getStockItem = async (req, res) => {
    try {
        const item = await Stock.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createStockItem = async (req, res) => {
    try {
        const itemId = await Stock.create(req.body);
        await logActivity(req, 'CREATED', 'StockItem', itemId, { name: req.body.name, quantity: req.body.quantity });
        res.status(201).json({ id: itemId, message: 'Stock item created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateStockItem = async (req, res) => {
    try {
        await Stock.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'StockItem', req.params.id, { name: req.body.name, quantity: req.body.quantity });
        res.json({ message: 'Stock item updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteStockItem = async (req, res) => {
    try {
        await Stock.delete(req.params.id);
        await logActivity(req, 'DELETED', 'StockItem', req.params.id);
        res.json({ message: 'Stock item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Stock.getCategories();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
