const Product = require('../models/products');
const Transaction = require('../models/transactions');
const User = require('../models/users');
const Report = require('../models/reports');
const { logReportActivity } = require('../utils/logActivity');

// Generate Inventory Report
exports.generateInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate, category, storageArea } = req.query;
    
    // Build filter object
    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (category) {
      filter.category = category;
    }
    if (storageArea) {
      filter.storageArea = storageArea;
    }

    // Get all products with filters
    const products = await Product.find(filter).sort({ category: 1, name: 1 });

    // Calculate inventory statistics
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockProducts = products.filter(product => product.quantity < 10);
    const outOfStockProducts = products.filter(product => product.quantity === 0);

    // Group by category
    const categoryStats = {};
    products.forEach(product => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = {
          count: 0,
          totalQuantity: 0,
          products: []
        };
      }
      categoryStats[product.category].count++;
      categoryStats[product.category].totalQuantity += product.quantity;
      categoryStats[product.category].products.push(product);
    });

    // Group by storage area
    const storageStats = {};
    products.forEach(product => {
      if (!storageStats[product.storageArea]) {
        storageStats[product.storageArea] = {
          count: 0,
          totalQuantity: 0,
          products: []
        };
      }
      storageStats[product.storageArea].count++;
      storageStats[product.storageArea].totalQuantity += product.quantity;
      storageStats[product.storageArea].products.push(product);
    });

    // Get unique categories and storage areas for filter options
    const categories = await Product.distinct('category');
    const storageAreas = await Product.distinct('storageArea');

    const report = {
      generatedAt: new Date(),
      filters: {
        startDate,
        endDate,
        category,
        storageArea
      },
      summary: {
        totalProducts,
        totalQuantity,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        categories: Object.keys(categoryStats).length,
        storageAreas: Object.keys(storageStats).length
      },
      lowStockProducts,
      outOfStockProducts,
      categoryStats,
      storageStats,
      allProducts: products,
      filterOptions: {
        categories,
        storageAreas
      }
    };

    // Save to reports collection
    await Report.create({
      type: 'inventory',
      generatedAt: report.generatedAt,
      generatedBy: req.user?.id,
      filters: report.filters,
      summary: `Total Products: ${report.summary.totalProducts}, Total Quantity: ${report.summary.totalQuantity}, Low Stock: ${report.summary.lowStockCount}, Out of Stock: ${report.summary.outOfStockCount}`
    });

    // Log the activity
    await logReportActivity(
      req.user,
      'generate_inventory_report',
      `Generated inventory report with ${totalProducts} products, ${totalQuantity} total quantity`
    );

    res.json(report);
  } catch (err) {
    console.error('Error generating inventory report:', err);
    res.status(500).json({ error: err.message });
  }
};

// Generate Transaction Report
exports.generateTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, type, userId, productId } = req.query;
    
    // Build filter object
    let filter = {};
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) {
      filter.type = type;
    }
    if (userId) {
      filter.userId = userId;
    }
    if (productId) {
      filter.productId = productId;
    }

    // Get all transactions with filters and populate related data
    const transactions = await Transaction.find(filter)
      .populate('productId', 'name category storageArea')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    // Filter out transactions with missing userId or productId
    const validTransactions = transactions.filter(
      t => t && t.userId && t.userId._id && t.productId && t.productId._id
    );

    // Calculate transaction statistics
    const totalTransactions = validTransactions.length;
    const dispatchTransactions = validTransactions.filter(t => t.type === 'dispatch');
    const addTransactions = validTransactions.filter(t => t.type === 'add');
    const updateTransactions = validTransactions.filter(t => t.type === 'update');

    // Calculate quantities by type
    const totalDispatchQuantity = dispatchTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalAddQuantity = addTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalUpdateQuantity = updateTransactions.reduce((sum, t) => sum + t.quantity, 0);

    // Group by date (daily)
    const dailyStats = {};
    validTransactions.forEach(transaction => {
      try {
        if (!transaction || !transaction.timestamp) {
          console.warn('Transaction missing timestamp:', transaction?._id);
          return; // Skip this transaction
        }
        
        const date = transaction.timestamp.toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            total: 0,
            dispatch: 0,
            add: 0,
            update: 0,
            transactions: []
          };
        }
        dailyStats[date].total++;
        dailyStats[date][transaction.type]++;
        dailyStats[date].transactions.push(transaction);
      } catch (error) {
        console.error('Error processing transaction for daily stats:', error, transaction);
      }
    });

    // Group by user
    const userStats = {};
    validTransactions.forEach(transaction => {
      try {
        // Check if transaction and userId exist and have _id
        if (!transaction || !transaction._id) {
          console.warn('Invalid transaction object:', transaction);
          return; // Skip this transaction
        }
        
        if (!transaction.userId || !transaction.userId._id) {
          console.warn('Transaction missing userId:', transaction._id);
          return; // Skip this transaction
        }
        
        const userId = transaction.userId._id.toString();
        if (!userStats[userId]) {
          userStats[userId] = {
            user: transaction.userId,
            total: 0,
            dispatch: 0,
            add: 0,
            update: 0,
            transactions: []
          };
        }
        userStats[userId].total++;
        userStats[userId][transaction.type]++;
        userStats[userId].transactions.push(transaction);
      } catch (error) {
        console.error('Error processing transaction for user stats:', error, transaction);
      }
    });

    // Group by product
    const productStats = {};
    validTransactions.forEach(transaction => {
      try {
        // Check if transaction and productId exist and have _id
        if (!transaction || !transaction._id) {
          console.warn('Invalid transaction object:', transaction);
          return; // Skip this transaction
        }
        
        if (!transaction.productId || !transaction.productId._id) {
          console.warn('Transaction missing productId:', transaction._id);
          return; // Skip this transaction
        }
        
        const productId = transaction.productId._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            product: transaction.productId,
            total: 0,
            dispatch: 0,
            add: 0,
            update: 0,
            totalDispatchQuantity: 0,
            totalAddQuantity: 0,
            totalUpdateQuantity: 0,
            transactions: []
          };
        }
        productStats[productId].total++;
        productStats[productId][transaction.type]++;
        productStats[productId][`total${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}Quantity`] += transaction.quantity;
        productStats[productId].transactions.push(transaction);
      } catch (error) {
        console.error('Error processing transaction for product stats:', error, transaction);
      }
    });

    // Get unique filter options
    const users = await User.find({}, 'name email');
    const products = await Product.find({}, 'name category');

    const report = {
      generatedAt: new Date(),
      filters: {
        startDate,
        endDate,
        type,
        userId,
        productId
      },
      summary: {
        totalTransactions,
        dispatchCount: dispatchTransactions.length,
        addCount: addTransactions.length,
        updateCount: updateTransactions.length,
        totalDispatchQuantity,
        totalAddQuantity,
        totalUpdateQuantity,
        uniqueUsers: Object.keys(userStats).length,
        uniqueProducts: Object.keys(productStats).length
      },
      dailyStats: Object.values(dailyStats).sort((a, b) => new Date(b.date) - new Date(a.date)),
      userStats: Object.values(userStats),
      productStats: Object.values(productStats),
      allTransactions: validTransactions,
      filterOptions: {
        types: ['dispatch', 'add', 'update'],
        users,
        products
      }
    };

    // Save to reports collection
    await Report.create({
      type: 'transaction',
      generatedAt: report.generatedAt,
      generatedBy: req.user?.id,
      filters: report.filters,
      summary: `Total Transactions: ${report.summary.totalTransactions}, Dispatch: ${report.summary.dispatchCount}, Add: ${report.summary.addCount}, Update: ${report.summary.updateCount}`
    });

    res.json(report);
  } catch (err) {
    console.error('Error generating transaction report:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get report filter options
exports.getReportFilterOptions = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const storageAreas = await Product.distinct('storageArea');
    const users = await User.find({}, 'name email');
    const products = await Product.find({}, 'name category');

    res.json({
      categories,
      storageAreas,
      users,
      products,
      transactionTypes: ['dispatch', 'add', 'update']
    });
  } catch (err) {
    console.error('Error getting filter options:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// Fetch recent reports
exports.getRecentReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .sort({ generatedAt: -1 })
      .limit(10)
      .populate('generatedBy', 'name email');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the report
    const report = await Report.findById(id).populate('generatedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Reconstruct the report data based on the report type and filters
    let reportData = {
      generatedAt: report.generatedAt,
      filters: report.filters,
      generatedBy: report.generatedBy,
      type: report.type
    };

    if (report.type === 'inventory') {
      // Reconstruct inventory report data
      const { startDate, endDate, category, storageArea } = report.filters || {};
      
      let filter = {};
      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (category) filter.category = category;
      if (storageArea) filter.storageArea = storageArea;

      const products = await Product.find(filter).sort({ category: 1, name: 1 });
      
      const totalProducts = products.length;
      const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
      const lowStockProducts = products.filter(product => product.quantity < 10);
      const outOfStockProducts = products.filter(product => product.quantity === 0);

      // Group by category
      const categoryStats = {};
      products.forEach(product => {
        if (!categoryStats[product.category]) {
          categoryStats[product.category] = {
            count: 0,
            totalQuantity: 0,
            products: []
          };
        }
        categoryStats[product.category].count++;
        categoryStats[product.category].totalQuantity += product.quantity;
        categoryStats[product.category].products.push(product);
      });

      // Group by storage area
      const storageStats = {};
      products.forEach(product => {
        if (!storageStats[product.storageArea]) {
          storageStats[product.storageArea] = {
            count: 0,
            totalQuantity: 0,
            products: []
          };
        }
        storageStats[product.storageArea].count++;
        storageStats[product.storageArea].totalQuantity += product.quantity;
        storageStats[product.storageArea].products.push(product);
      });

      reportData = {
        ...reportData,
        summary: {
          totalProducts,
          totalQuantity,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          categories: Object.keys(categoryStats).length,
          storageAreas: Object.keys(storageStats).length
        },
        lowStockProducts,
        outOfStockProducts,
        categoryStats,
        storageStats,
        allProducts: products
      };
    } else if (report.type === 'transaction') {
      // Reconstruct transaction report data
      const { startDate, endDate, type, userId, productId } = report.filters || {};
      
      let filter = {};
      if (startDate && endDate) {
        filter.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (type) filter.type = type;
      if (userId) filter.userId = userId;
      if (productId) filter.productId = productId;

      const transactions = await Transaction.find(filter)
        .populate('productId', 'name category storageArea')
        .populate('userId', 'name email')
        .sort({ timestamp: -1 });

      const validTransactions = transactions.filter(
        t => t && t.userId && t.userId._id && t.productId && t.productId._id
      );

      const totalTransactions = validTransactions.length;
      const dispatchTransactions = validTransactions.filter(t => t.type === 'dispatch');
      const addTransactions = validTransactions.filter(t => t.type === 'add');
      const updateTransactions = validTransactions.filter(t => t.type === 'update');

      const totalDispatchQuantity = dispatchTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const totalAddQuantity = addTransactions.reduce((sum, t) => sum + t.quantity, 0);
      const totalUpdateQuantity = updateTransactions.reduce((sum, t) => sum + t.quantity, 0);

      // Group by user
      const userStats = {};
      validTransactions.forEach(transaction => {
        const userId = transaction.userId._id.toString();
        if (!userStats[userId]) {
          userStats[userId] = {
            user: transaction.userId,
            total: 0,
            dispatch: 0,
            add: 0,
            update: 0,
            transactions: []
          };
        }
        userStats[userId].total++;
        userStats[userId][transaction.type]++;
        userStats[userId].transactions.push(transaction);
      });

      reportData = {
        ...reportData,
        summary: {
          totalTransactions,
          dispatchCount: dispatchTransactions.length,
          addCount: addTransactions.length,
          updateCount: updateTransactions.length,
          totalDispatchQuantity,
          totalAddQuantity,
          totalUpdateQuantity,
          uniqueUsers: Object.keys(userStats).length
        },
        userStats: Object.values(userStats),
        allTransactions: validTransactions
      };
    }

    res.json(reportData);
  } catch (err) {
    console.error('Error fetching report by ID:', err);
    res.status(500).json({ error: err.message });
  }
}; 