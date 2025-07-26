import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StorageUtilizationChart = ({ dashboardStats }) => {
  // Calculate storage area utilization
  const getStorageUtilization = () => {
    if (!dashboardStats?.recentTransactions) return [];
    
    const storageAreas = {};
    
    // Group by storage area and sum quantities
    dashboardStats.recentTransactions.forEach(transaction => {
      if (transaction.productId?.name) {
        const storageArea = getStorageAreaFromProduct(transaction.productId.name);
        if (storageArea) {
          if (!storageAreas[storageArea]) {
            storageAreas[storageArea] = 0;
          }
          storageAreas[storageArea] += transaction.quantity;
        }
      }
    });
    
    return Object.entries(storageAreas).map(([area, quantity]) => ({ area, quantity }));
  };

  const getStorageAreaFromProduct = (productName) => {
    // This is a simplified mapping - in a real app, you'd get this from the product data
    if (productName.toLowerCase().includes('seed')) return 'Warehouse A';
    if (productName.toLowerCase().includes('seedling')) return 'Greenhouse 1';
    if (productName.toLowerCase().includes('fertilizer') || productName.toLowerCase().includes('compost')) return 'Storage Room B';
    if (productName.toLowerCase().includes('shovel') || productName.toLowerCase().includes('watering')) return 'Outdoor Storage';
    return 'Other';
  };

  const data = getStorageUtilization();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Storage Area Utilization</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="area" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StorageUtilizationChart; 