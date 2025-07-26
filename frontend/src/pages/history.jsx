import React, { useState, useEffect } from 'react';
import { ClockIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '../config/api';

const History = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  useEffect(() => {
    fetchActivityLogs();
  }, [pagination.currentPage, searchQuery, filterAction]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery
      });
      
      if (filterAction !== 'all') {
        params.append('action', filterAction);
      }
      
      const response = await fetch(buildApiUrl(`/activity-logs?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      
      const data = await response.json();
      setActivityLogs(data.logs);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'add_product':
      case 'add':
        return 'bg-green-100 text-green-800';
      case 'update_product':
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete_product':
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'dispatch_product':
      case 'dispatch':
        return 'bg-orange-100 text-orange-800';
      case 'generate_inventory_report':
      case 'generate_transaction_report':
        return 'bg-purple-100 text-purple-800';
      case 'create_backup':
      case 'restore_backup':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">HISTORY</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Export History</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Actions</option>
            <option value="add_product">Add Product</option>
            <option value="update_product">Update Product</option>
            <option value="delete_product">Delete Product</option>
            <option value="dispatch_product">Dispatch Product</option>
            <option value="adjust_product">Adjust Product</option>
            <option value="generate_inventory_report">Generate Report</option>
            <option value="create_backup">Create Backup</option>
            <option value="restore_backup">Restore Backup</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length > 0 ? (
                  activityLogs.map((log, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium">
                        {log.details || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.user?.name || 'Unknown User'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.resource || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Total Activities</h3>
          <p className="text-3xl font-bold text-gray-800">{pagination.totalItems}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-gray-800">
            {activityLogs.filter(log => {
              const logDate = new Date(log.timestamp);
              const now = new Date();
              return logDate.getMonth() === now.getMonth() && 
                     logDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Today</h3>
          <p className="text-3xl font-bold text-gray-800">
            {activityLogs.filter(log => {
              const logDate = new Date(log.timestamp);
              const today = new Date();
              return logDate.toDateString() === today.toDateString();
            }).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default History; 