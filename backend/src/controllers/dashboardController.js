const Product = require('../models/products');
const Transaction = require('../models/transactions');

const getDashboardStats = async (req, res) => {
  try {
    // Get current date and calculate previous period dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get current stats
    const totalSeeds = await Product.countDocuments({ category: 'Seeds' });
    const totalSeedlings = await Product.countDocuments({ category: 'Seedlings' });
    const totalHVC = await Product.countDocuments({ category: 'HVC (High Value Crops)' });
    
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

    // Calculate percentage changes based on recent activity
    // For dispatch items - compare with yesterday's total
    const yesterdayDispatchResult = await Transaction.aggregate([
      { 
        $match: { 
          type: 'dispatch',
          timestamp: { $lt: yesterday }
        } 
      },
      {
        $group: {
          _id: null,
          totalDispatchItems: { $sum: '$quantity' }
        }
      }
    ]);
    const yesterdayDispatchItems = yesterdayDispatchResult.length > 0 ? yesterdayDispatchResult[0].totalDispatchItems : 0;

    // For remaining stock - compare with yesterday's total
    const yesterdayStockResult = await Product.aggregate([
      {
        $match: { updatedAt: { $lt: yesterday } }
      },
      {
        $group: {
          _id: null,
          remainingStock: { $sum: '$quantity' }
        }
      }
    ]);
    const yesterdayRemainingStock = yesterdayStockResult.length > 0 ? yesterdayStockResult[0].remainingStock : 0;

    // For product counts - check if there were any new products added recently
    const recentSeeds = await Product.countDocuments({ 
      category: 'Seeds',
      createdAt: { $gte: yesterday }
    });
    const recentSeedlings = await Product.countDocuments({ 
      category: 'Seedlings',
      createdAt: { $gte: yesterday }
    });
    const recentHVC = await Product.countDocuments({ 
      category: 'HVC (High Value Crops)',
      createdAt: { $gte: yesterday }
    });

    // Get yesterday's product counts for proper comparison
    const yesterdaySeeds = await Product.countDocuments({ 
      category: 'Seeds',
      createdAt: { $lt: yesterday }
    });
    const yesterdaySeedlings = await Product.countDocuments({ 
      category: 'Seedlings',
      createdAt: { $lt: yesterday }
    });
    const yesterdayHVC = await Product.countDocuments({ 
      category: 'HVC (High Value Crops)',
      createdAt: { $lt: yesterday }
    });

    // Calculate percentage changes with more meaningful logic
    const calculatePercentageChange = (current, previous, recentActivity = 0) => {
      // If there's recent activity (new items added), show positive change
      if (recentActivity > 0) {
        return `+${recentActivity * 100}%`;
      }
      
      // If there's no previous data but current data exists
      if (previous === 0 && current > 0) {
        return '+100%';
      }
      
      // If there's no change
      if (current === previous) {
        return '+0%';
      }
      
      // Calculate actual percentage change
      if (previous > 0) {
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${Math.round(change)}%`;
      }
      
      // Default case
      return '+0%';
    };

    // Get recent transactions for the table
    const recentTransactions = await Transaction.find()
      .populate('productId', 'name')
      .populate('userId', 'name')
      .sort({ timestamp: -1 })
      .limit(10);
    
    // Get all products for charts
    const allProducts = await Product.find().sort({ name: 1 });
    console.log('Backend - allProducts count:', allProducts.length);
    console.log('Backend - allProducts sample:', allProducts.slice(0, 2));
    
    const stats = {
      totalSeeds: {
        value: totalSeeds,
        change: calculatePercentageChange(totalSeeds, yesterdaySeeds, recentSeeds > 0 ? 1 : 0)
      },
      totalSeedlings: {
        value: totalSeedlings,
        change: calculatePercentageChange(totalSeedlings, yesterdaySeedlings, recentSeedlings > 0 ? 1 : 0)
      },
      totalHVC: {
        value: totalHVC,
        change: calculatePercentageChange(totalHVC, yesterdayHVC, recentHVC > 0 ? 1 : 0)
      },
      totalDispatchItems: {
        value: totalDispatchItems,
        change: calculatePercentageChange(totalDispatchItems, yesterdayDispatchItems)
      },
      remainingStock: {
        value: remainingStock,
        change: (() => {
          // For remaining stock, we want to show actual decrease/increase
          if (yesterdayRemainingStock === 0 && remainingStock > 0) {
            return '+100%';
          }
          if (yesterdayRemainingStock === 0 && remainingStock === 0) {
            return '+0%';
          }
          if (yesterdayRemainingStock > 0) {
            const change = ((remainingStock - yesterdayRemainingStock) / yesterdayRemainingStock) * 100;
            const sign = change >= 0 ? '+' : '';
            return `${sign}${Math.round(change)}%`;
          }
          return '+0%';
        })()
      },
      recentTransactions,
      allProducts
    };
    
    console.log('Backend - Final response keys:', Object.keys(stats));
    console.log('Backend - allProducts in response:', stats.allProducts ? 'Present' : 'Missing');
    console.log('Backend - Dispatch comparison:', { current: totalDispatchItems, yesterday: yesterdayDispatchItems });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  getDashboardStats
}; 