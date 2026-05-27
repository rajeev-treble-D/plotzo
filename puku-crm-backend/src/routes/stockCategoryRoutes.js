const express = require('express');
const router = express.Router();
const stockCategoryController = require('../controllers/stockCategoryController');
const { auth } = require('../middleware/auth');

router.get('/', auth, stockCategoryController.getAllCategories);
router.post('/', auth, stockCategoryController.createCategory);
router.put('/:id', auth, stockCategoryController.updateCategory);
router.delete('/:id', auth, stockCategoryController.deleteCategory);

module.exports = router;
