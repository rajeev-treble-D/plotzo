const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerDetails, searchCustomers } = require('../controllers/customerController');
const { auth, authorize } = require('../middleware/auth');

// All customer routes require authentication
router.get('/', auth, getCustomers);
router.get('/search', auth, searchCustomers);
router.post('/', auth, createCustomer);

// Update and Delete might require higher privileges, e.g., Admin or Manager
router.get('/:id/details', auth, getCustomerDetails);
router.put('/:id', auth, authorize('Admin', 'Manager'), updateCustomer);
router.delete('/:id', auth, authorize('Admin'), deleteCustomer);

module.exports = router;
