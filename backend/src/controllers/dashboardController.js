const Product = require('../models/products');
const Transaction = require('../models/transactions');

const getDashboardStats = async (req, res) => {
  try {
    // Get total seeds (products with category 'Seeds')
    const totalSeeds = await Product.countDocuments({ category: 'Seeds' });
    
    // Get total seedlings (products with category 'Seedlings')
    const totalSeedlings = await Product.countDocuments({ category: 'Seedlings' });
    
    // Get total dispatch items (sum of quantities from dispatch transactions)
    const dispatchResult = await Transaction.aggregate([
      { $match: { type: 'dispatch' } },
      {
        $group: {
          _id: null,
          totalDispatchItems: { $sum: '$quantity' }
        }
      }
    ]);
    const totalDispatchItems = dispatchResult.length > 0 ? dispatchResult[0].totalDispatchItems : 0;
    
    // Get remaining stock (sum of all product quantities)
    const remainingStockResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          remainingStock: { $sum: '$quantity' }
        }
      }
    ]);
    const remainingStock = remainingStockResult.length > 0 ? remainingStockResult[0].remainingStock : 0;
    
    // Get recent transactions for the table
    const recentTransactions = await Transaction.find()
      .populate('productId', 'name')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Calculate percentage changes (you can implement more sophisticated logic later)
    const stats = {
      totalSeeds: {
        value: totalSeeds,
        change: '+0%' // You can implement change calculation based on time periods
      },
      totalSeedlings: {
        value: totalSeedlings,
        change: '+0%'
      },
      totalDispatchItems: {
        value: totalDispatchItems,
        change: '+0%'
      },
      remainingStock: {
        value: remainingStock,
        change: '+0%'
      },
      recentTransactions
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  getDashboardStats
}; 