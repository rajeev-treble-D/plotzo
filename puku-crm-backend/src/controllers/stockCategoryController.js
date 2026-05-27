const StockCategory = require('../models/StockCategory');
const { logActivity } = require('../utils/logger');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await StockCategory.findAll();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const categoryId = await StockCategory.create(name, description, color);
        await logActivity(req, 'CREATED', 'StockCategory', categoryId, { name });

        res.status(201).json({ success: true, id: categoryId, message: 'Category created successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color } = req.body;

        await StockCategory.update(id, name, description, color);
        await logActivity(req, 'UPDATED', 'StockCategory', id, { name });

        res.json({ success: true, message: 'Category updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await StockCategory.delete(id);
        await logActivity(req, 'DELETED', 'StockCategory', id);

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
