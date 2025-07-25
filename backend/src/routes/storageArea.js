const express = require('express');
const router = express.Router();
const storageAreaController = require('../controllers/storageAreaController');

router.get('/', storageAreaController.getAllStorageAreas);

module.exports = router; 