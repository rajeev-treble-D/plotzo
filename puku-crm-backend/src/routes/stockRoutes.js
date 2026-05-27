const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { auth } = require('../middleware/auth');

// Stock management routes (Protected)
router.get('/', auth, stockController.getInventory);
router.get('/categories', auth, stockController.getCategories);
router.get('/:id', auth, stockController.getStockItem);
router.post('/', auth, stockController.createStockItem);
router.put('/:id', auth, stockController.updateStockItem);
router.delete('/:id', auth, stockController.deleteStockItem);

module.exports = router;
