const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: { type: String, enum: ['inventory', 'transaction'], required: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filters: { type: Object },
  summary: { type: String },
  // Optionally: fileUrl, status, etc.
});

module.exports = mongoose.model('Report', reportSchema); 