import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionActivityChart = ({ dashboardStats }) => {
  const [timeFilter, setTimeFilter] = useState('7days'); // Default to 7 days

  // Calculate transaction activity by type with time filtering
  const getTransactionActivity = () => {
    // Use allTransactionsForCharts if available, otherwise fall back to recentTransactions
    const transactions = dashboardStats?.allTransactionsForCharts || dashboardStats?.recentTransactions;
    if (!transactions) return [];
    
    const now = new Date();
    let filterDate;
    
    // Set filter date based on selected time period
    switch (timeFilter) {
      case 'today':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        filterDate = new Date(0); // Beginning of time
        break;
      default:
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const activity = {
      'Add': 0,
      'Dispatch': 0,
      'Update': 0
    };
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      
      // Only count transactions within the selected time period
      if (transactionDate >= filterDate) {
        const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        if (activity.hasOwnProperty(type)) {
          activity[type]++;
        }
      }
    });
    
    return Object.entries(activity).map(([type, count]) => ({ type, count }));
  };

  const data = getTransactionActivity();
  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  // Get time period label
  const getTimeLabel = () => {
    switch (timeFilter) {
      case 'today':
        return 'Today';
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case 'all':
        return 'All Time';
      default:
        return 'Last 7 Days';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-800">Transaction Activity</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Period:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-4">
        Showing transaction activity for: <span className="font-medium text-green-700">{getTimeLabel()}</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, 'Count']}
              labelStyle={{ color: '#374151' }}
            />
            <Legend />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionActivityChart; 