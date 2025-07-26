const express = require('express');
const router = express.Router();
const { 
  getActivityLogs, 
  getActivityStats, 
  getRecentActivityLogs 
} = require('../controllers/activityLogController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all activity logs with filtering and pagination
router.get('/', getActivityLogs);

// Get activity statistics
router.get('/stats', getActivityStats);

// Get recent activity logs (for dashboard)
router.get('/recent', getRecentActivityLogs);

module.exports = router; 