const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { auth } = require('../middleware/auth');

// Property management routes (Protected)
router.get('/', auth, propertyController.getProperties);
router.get('/type/:propertyType', auth, propertyController.getPropertiesByType);
router.get('/:id', auth, propertyController.getPropertyById);
router.post('/', auth, propertyController.createProperty);
router.put('/:id', auth, propertyController.updateProperty);
router.delete('/:id', auth, propertyController.deleteProperty);

module.exports = router;
