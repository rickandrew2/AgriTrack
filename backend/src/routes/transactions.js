const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const auth = require('../middleware/auth');

router.get('/', transactionsController.getAllTransactions);
router.post('/', auth, transactionsController.createTransaction);

module.exports = router; 