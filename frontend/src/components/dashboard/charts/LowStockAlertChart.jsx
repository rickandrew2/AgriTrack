import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LowStockAlertChart = ({ dashboardStats }) => {
  // Get low stock products (quantity < 10)
  const getLowStockProducts = () => {
    if (!dashboardStats?.recentTransactions) return [];
    
    const products = {};
    
    // Group by product and sum quantities
    dashboardStats.recentTransactions.forEach(transaction => {
      if (transaction.productId?.name) {
        const productName = transaction.productId.name;
        if (!products[productName]) {
          products[productName] = 0;
        }
        products[productName] += transaction.quantity;
      }
    });
    
    // Filter low stock items and sort by quantity
    return Object.entries(products)
      .filter(([name, quantity]) => quantity < 10)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5); // Show top 5 low stock items
  };

  const data = getLowStockProducts();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Low Stock Alerts</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="horizontal" data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LowStockAlertChart; 