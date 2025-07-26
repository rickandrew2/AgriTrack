const ActivityLog = require('../models/activityLog');

// Get all activity logs with filtering and pagination
const getActivityLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      user, 
      resource, 
      status,
      startDate,
      endDate,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (action) filter.action = action;
    if (user) filter.user = user;
    if (resource) filter.resource = resource;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { details: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get logs with populated user data
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
};

// Get activity log statistics
const getActivityStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get activity counts by action type
    const actionStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get activity counts by user
    const userStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          userName: { $first: '$userData.name' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get total activities in period
    const totalActivities = await ActivityLog.countDocuments({
      timestamp: { $gte: startDate }
    });

    res.json({
      period,
      totalActivities,
      actionStats,
      userStats
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Failed to fetch activity statistics' });
  }
};

// Get recent activity logs (for dashboard)
const getRecentActivityLogs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const logs = await ActivityLog.find()
      .populate('user', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Error fetching recent activity logs:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity logs' });
  }
};

module.exports = {
  getActivityLogs,
  getActivityStats,
  getRecentActivityLogs
}; 