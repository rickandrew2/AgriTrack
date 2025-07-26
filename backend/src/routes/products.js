const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

// Protected routes (require authentication)
router.post('/', auth, productsController.createProduct);
router.put('/:id', auth, productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);

module.exports = router;
