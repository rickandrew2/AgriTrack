const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['dispatch', 'add', 'update', 'delete'], required: true },
  quantity: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  remarks: { type: String },
  productName: { type: String }, // Store product name for deleted products
  productCategory: { type: String } // Store product category for deleted products
});

module.exports = mongoose.model('Transaction', transactionSchema); 