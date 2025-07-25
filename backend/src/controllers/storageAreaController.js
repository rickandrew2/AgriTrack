const StorageArea = require('../models/storageArea');

// Get all storage areas
exports.getAllStorageAreas = async (req, res) => {
  try {
    const storageAreas = await StorageArea.find();
    res.json(storageAreas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 