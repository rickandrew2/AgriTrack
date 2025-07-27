import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionTrendsChart = ({ dashboardStats }) => {
  // Get transaction trends over time
  const getTransactionTrends = () => {
    if (!dashboardStats?.recentTransactions) return [];
    
    // Group transactions by date and type
    const trendsByDate = {};
    
    dashboardStats.recentTransactions.forEach(transaction => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const type = transaction.type;
      
      if (!trendsByDate[date]) {
        trendsByDate[date] = { date, Add: 0, Dispatch: 0, Update: 0, Delete: 0 };
      }
      
      trendsByDate[date][type.charAt(0).toUpperCase() + type.slice(1)]++;
    });
    
    // Convert to array and sort by date
    return Object.values(trendsByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = data;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
      <h3 className="text-xl font-semibold text-green-800 mb-6">Transaction Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Add" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Dispatch" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Update" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionTrendsChart; 