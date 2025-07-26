const ActivityLog = require('../models/activityLog');

/**
 * Log an activity to the database
 * @param {Object} params - Log parameters
 * @param {Object} params.user - User object or user ID
 * @param {string} params.action - Action performed (e.g., 'add_product', 'delete_backup')
 * @param {string} params.details - Detailed description of the action
 * @param {string} params.status - Status of the action ('success', 'failed', 'pending')
 * @param {string} params.resource - Resource type (e.g., 'product', 'backup', 'report')
 * @param {string} params.resourceId - ID of the affected resource
 * @param {string} params.ipAddress - IP address of the user
 * @param {string} params.userAgent - User agent string
 */
async function logActivity({
  user,
  action,
  details,
  status = 'success',
  resource,
  resourceId,
  ipAddress,
  userAgent
}) {
  try {
    // Ensure user is an ObjectId
    const userId = typeof user === 'object' ? user._id || user.id : user;
    
    await ActivityLog.create({
      user: userId,
      action,
      details,
      status,
      resource,
      resourceId,
      ipAddress,
      userAgent
    });
    
    console.log(`Activity logged: ${action} - ${details}`);
  } catch (err) {
    console.error('Failed to log activity:', err);
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Log a product-related activity
 */
async function logProductActivity(user, action, product, details, status = 'success') {
  await logActivity({
    user,
    action,
    details,
    status,
    resource: 'product',
    resourceId: product._id || product
  });
}

/**
 * Log a backup-related activity
 */
async function logBackupActivity(user, action, details, status = 'success') {
  await logActivity({
    user,
    action,
    details,
    status,
    resource: 'backup'
  });
}

/**
 * Log a report-related activity
 */
async function logReportActivity(user, action, details, status = 'success') {
  await logActivity({
    user,
    action,
    details,
    status,
    resource: 'report'
  });
}

/**
 * Log a user-related activity
 */
async function logUserActivity(user, action, details, status = 'success') {
  await logActivity({
    user,
    action,
    details,
    status,
    resource: 'user'
  });
}

module.exports = {
  logActivity,
  logProductActivity,
  logBackupActivity,
  logReportActivity,
  logUserActivity
}; 