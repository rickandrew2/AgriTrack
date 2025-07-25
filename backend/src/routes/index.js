const express = require('express');
const router = express.Router();

const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const storageAreaRoutes = require('./storageArea');
const userRoutes = require('./users');
const barangayRoutes = require('./barangays');
const transactionRoutes = require('./transactions');

router.get('/', (req, res) => {
  res.send('API Root');
});

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/storage-areas', storageAreaRoutes);
router.use('/users', userRoutes);
router.use('/barangays', barangayRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
