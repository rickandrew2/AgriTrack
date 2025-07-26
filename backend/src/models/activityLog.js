const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  action: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'],
    default: 'success' 
  },
  resource: { 
    type: String 
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 