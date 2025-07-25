const Barangay = require('../models/barangays');

// Get all barangays
exports.getAllBarangays = async (req, res) => {
  try {
    const barangays = await Barangay.find();
    res.json(barangays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 