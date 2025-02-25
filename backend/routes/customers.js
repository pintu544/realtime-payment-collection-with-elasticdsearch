const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// Create customer
router.post(
  '/',
  authMiddleware,
  [
    check('name', 'Name is required').notEmpty(),
    check('contact', 'Contact is required').notEmpty(),
    check('paymentDueDate', 'Payment due date is required').notEmpty()
  ],
  customerController.createCustomer
);

// Get all customers
router.get('/', authMiddleware, customerController.getCustomers);

// Update customer
router.put('/:id', authMiddleware, customerController.updateCustomer);

// Delete customer
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

// Bulk upload customers via Excel
router.post('/upload', authMiddleware, customerController.uploadMiddleware, customerController.bulkUpload);

module.exports = router;