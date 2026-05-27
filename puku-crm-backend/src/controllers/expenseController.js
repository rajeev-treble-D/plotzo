const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');
const { logActivity } = require('../utils/logger');

// Expense Records
exports.getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { expenses, total } = await Expense.getPaginated(limit, offset);
        res.json({ success: true, expenses, total, page, limit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const expenseId = await Expense.create(req.body);
        await logActivity(req, 'CREATED', 'Expense', expenseId, { amount: req.body.amount, description: req.body.description });
        res.status(201).json({ id: expenseId, message: 'Expense recorded successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        await Expense.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'Expense', req.params.id, { amount: req.body.amount });
        res.json({ message: 'Expense updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await Expense.delete(req.params.id);
        await logActivity(req, 'DELETED', 'Expense', req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMonthlySummary = async (req, res) => {
    try {
        const summary = await Expense.getMonthlySummary();
        res.json({ success: true, summary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Expense Categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.findAll();
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const categoryId = await ExpenseCategory.create(req.body);
        await logActivity(req, 'CREATED', 'ExpenseCategory', categoryId, { name: req.body.name });
        res.status(201).json({ id: categoryId, message: 'Category created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        await ExpenseCategory.update(req.params.id, req.body);
        await logActivity(req, 'UPDATED', 'ExpenseCategory', req.params.id, { name: req.body.name });
        res.json({ message: 'Category updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await ExpenseCategory.delete(req.params.id);
        await logActivity(req, 'DELETED', 'ExpenseCategory', req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
