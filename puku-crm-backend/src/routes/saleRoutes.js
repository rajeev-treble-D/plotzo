const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { auth } = require('../middleware/auth');

// Sale management routes (Protected)
router.get('/', auth, saleController.getSales);
router.get('/:id', auth, saleController.getSaleById);
router.post('/', auth, saleController.createSale);
router.put('/:id', auth, saleController.updateSale);
router.delete('/:id', auth, saleController.deleteSale);

module.exports = router;
