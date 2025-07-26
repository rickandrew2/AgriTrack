import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const InventoryDistributionChart = ({ dashboardStats }) => {
  // Calculate inventory distribution by category from actual products
  const getInventoryDistribution = () => {
    console.log('InventoryDistributionChart - dashboardStats:', dashboardStats);
    console.log('InventoryDistributionChart - allProducts:', dashboardStats?.allProducts);
    if (!dashboardStats?.allProducts) return [];
    
    const categories = {};
    
    // Group products by category and sum quantities from actual stock levels
    dashboardStats.allProducts.forEach(product => {
      const category = product.category;
      if (category) {
        categories[category] = (categories[category] || 0) + product.quantity;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
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