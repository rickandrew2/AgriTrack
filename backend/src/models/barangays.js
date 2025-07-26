const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  rice: { type: Number, default: 0 },
  corn: { type: Number, default: 0 },
  highValue: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percentToTotal: { type: Number, default: 0 }
}, { _id: false });

const barangaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  report: { type: reportSchema, default: () => ({}) }
});

module.exports = mongoose.model('Barangay', barangaySchema); 