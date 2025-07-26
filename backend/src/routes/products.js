const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadData } = require('../middleware/upload');

// Public routes
router.get('/', productsController.getAllProducts);

// Import products (CSV/XLSX)
router.post('/import', auth, uploadData.single('file'), productsController.importProducts);

// Export products (CSV/XLSX)
router.get('/export', auth, productsController.exportProducts);

// Protected routes (require authentication)
router.post('/', auth, upload.single('image'), productsController.createProduct);
router.put('/:id', auth, upload.single('image'), productsController.updateProduct);
router.delete('/:id', auth, productsController.deleteProduct);

// Get product by ID (must be last to avoid conflicts)
router.get('/:id', productsController.getProductById);

module.exports = router;
