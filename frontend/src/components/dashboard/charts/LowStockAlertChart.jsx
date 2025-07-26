import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LowStockAlertChart = ({ dashboardStats }) => {
  // Get low stock products (quantity < 10)
  const getLowStockProducts = () => {
    if (!dashboardStats?.allProducts) return [];
    
    // Use actual product stock levels instead of transaction data
    const lowStockProducts = dashboardStats.allProducts
      .filter(product => product.quantity < 10) // Low stock threshold
      .map(product => ({
        name: product.name,
        quantity: product.quantity
      }))
      .sort((a, b) => a.quantity - b.quantity) // Sort by quantity (lowest first)
      .slice(0, 5); // Show top 5 low stock items
    
    return lowStockProducts;
  };

  const data = getLowStockProducts();
  const chartData = data;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Low Stock Alerts</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="horizontal" data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 10]} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LowStockAlertChart; 