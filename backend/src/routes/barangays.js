const express = require('express');
const router = express.Router();
const barangaysController = require('../controllers/barangaysController');

router.get('/', barangaysController.getAllBarangays);

module.exports = router; 