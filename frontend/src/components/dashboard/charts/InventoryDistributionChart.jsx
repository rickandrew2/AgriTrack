import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const InventoryDistributionChart = ({ dashboardStats }) => {
  // Calculate inventory distribution by category
  const getInventoryDistribution = () => {
    if (!dashboardStats?.recentTransactions) return [];
    
    const categories = {};
    
    // Group products by category and sum quantities
    dashboardStats.recentTransactions.forEach(transaction => {
      if (transaction.productId?.name) {
        const category = getCategoryFromProduct(transaction.productId.name);
        if (category) {
          categories[category] = (categories[category] || 0) + transaction.quantity;
        }
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getCategoryFromProduct = (productName) => {
    if (productName.toLowerCase().includes('seed')) return 'Seeds';
    if (productName.toLowerCase().includes('seedling')) return 'Seedlings';
    if (productName.toLowerCase().includes('fertilizer') || productName.toLowerCase().includes('compost')) return 'Fertilizers';
    if (productName.toLowerCase().includes('shovel') || productName.toLowerCase().includes('watering')) return 'Tools';
    return 'Other';
  };

  const data = getInventoryDistribution();
  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Inventory Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryDistributionChart; 