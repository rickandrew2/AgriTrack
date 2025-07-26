const express = require('express');
const router = express.Router();

const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const storageAreaRoutes = require('./storageArea');
const userRoutes = require('./users');
const barangayRoutes = require('./barangays');
const transactionRoutes = require('./transactions');
const dashboardRoutes = require('./dashboard');
const reportRoutes = require('./reports');
const activityLogRoutes = require('./activityLog');

router.get('/', (req, res) => {
  res.send('API Root');
});

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/storage-areas', storageAreaRoutes);
router.use('/users', userRoutes);
router.use('/barangays', barangayRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/activity-logs', activityLogRoutes);

module.exports = router;
