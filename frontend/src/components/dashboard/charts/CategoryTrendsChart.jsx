import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CategoryTrendsChart = ({ dashboardStats }) => {
  // Get category trends over time from actual data
  const getCategoryTrends = () => {
    if (!dashboardStats?.allProducts) return [];
    
    // Group products by category
    const categories = {
      'Seeds': 0,
      'Seedlings': 0,
      'Fertilizers': 0,
      'Tools': 0
    };
    
    dashboardStats.allProducts.forEach(product => {
      if (categories.hasOwnProperty(product.category)) {
        categories[product.category] += product.quantity;
      }
    });
    
    // Create a single data point with current category totals
    const today = new Date().toLocaleDateString();
    const dataPoint = { date: today };
    
    Object.entries(categories).forEach(([category, total]) => {
      dataPoint[category] = total;
    });
    
    return [dataPoint];
  };

  const data = getCategoryTrends();
  
  const chartData = data;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
      <h3 className="text-xl font-semibold text-green-800 mb-6">Category Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Seeds" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Seedlings" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Fertilizers" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="Tools" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryTrendsChart; 