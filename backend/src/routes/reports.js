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

// Fetch recent reports
router.get('/recent', reportsController.getRecentReports);

// Get specific report by ID
router.get('/:id', reportsController.getReportById);

module.exports = router; 