const Transaction = require('../models/transactions');
const Product = require('../models/products');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('productId', 'name category')
      .populate('userId', 'name')
      .sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { productId, type, quantity, remarks } = req.body;
    const userId = req.user.id; // From auth middleware
    
    console.log('Request body:', req.body);
    console.log('req.user:', req.user);
    console.log('userId:', userId);

    // Validate required fields
    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: 'Product ID, type, and quantity are required' });
    }

    // Validate transaction type
    if (!['dispatch', 'add', 'update'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    // Get the product to check current quantity
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // For dispatch transactions, check if there's enough stock
    if (type === 'dispatch' && quantity > product.quantity) {
      return res.status(400).json({ error: 'Insufficient stock for dispatch' });
    }

    // Create the transaction
    const transaction = new Transaction({
      productId,
      type,
      quantity,
      userId,
      remarks
    });

    await transaction.save();

    // Update product quantity based on transaction type
    let newQuantity = product.quantity;
    if (type === 'dispatch') {
      newQuantity -= quantity;
    } else if (type === 'add') {
      newQuantity += quantity;
    } else if (type === 'update') {
      newQuantity = quantity; // Direct update
    }

    // Update the product
    await Product.findByIdAndUpdate(productId, { quantity: newQuantity });

    // Return the created transaction with populated fields
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('productId', 'name category')
      .populate('userId', 'name');

    res.status(201).json(populatedTransaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: err.message });
  }
}; 