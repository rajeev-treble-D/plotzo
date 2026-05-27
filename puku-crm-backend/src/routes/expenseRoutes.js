const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

// Expense Records (Protected)
router.get('/summary', auth, expenseController.getMonthlySummary);
router.get('/', auth, expenseController.getExpenses);
router.get('/:id', auth, expenseController.getExpenseById);
router.post('/', auth, expenseController.createExpense);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

// Expense Categories (Protected)
router.get('/categories/all', auth, expenseController.getCategories);
router.post('/categories', auth, expenseController.createCategory);
router.put('/categories/:id', auth, expenseController.updateCategory);
router.delete('/categories/:id', auth, expenseController.deleteCategory);

module.exports = router;
