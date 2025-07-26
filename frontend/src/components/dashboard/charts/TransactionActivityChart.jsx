import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionActivityChart = ({ dashboardStats }) => {
  // Calculate transaction activity by type
  const getTransactionActivity = () => {
    if (!dashboardStats?.recentTransactions) return [];
    
    const activity = {
      'Add': 0,
      'Dispatch': 0,
      'Update': 0
    };
    
    dashboardStats.recentTransactions.forEach(transaction => {
      const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
      if (activity.hasOwnProperty(type)) {
        activity[type]++;
      }
    });
    
    return Object.entries(activity).map(([type, count]) => ({ type, count }));
  };

  const data = getTransactionActivity();
  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Transaction Activity</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionActivityChart; 