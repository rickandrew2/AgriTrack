const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

router.get('/', productsController.getAllProducts);

// Add more routes as needed (POST, PUT, DELETE, etc.)

module.exports = router;
