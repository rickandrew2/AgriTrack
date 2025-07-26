const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Generate inventory report
router.get('/inventory', reportsController.generateInventoryReport);

// Generate transaction report
router.get('/transactions', reportsController.generateTransactionReport);

// Get filter options for reports
router.get('/filter-options', reportsController.getReportFilterOptions);

module.exports = router; 