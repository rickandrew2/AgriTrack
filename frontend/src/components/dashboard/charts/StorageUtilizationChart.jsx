import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StorageUtilizationChart = ({ dashboardStats }) => {
  // Calculate storage area utilization from actual products
  const getStorageUtilization = () => {
    if (!dashboardStats?.allProducts) return [];
    
    const storageAreas = {};
    
    // Group by storage area and sum quantities from actual stock levels
    dashboardStats.allProducts.forEach(product => {
      const storageArea = product.storageArea;
      if (storageArea) {
        if (!storageAreas[storageArea]) {
          storageAreas[storageArea] = 0;
        }
        storageAreas[storageArea] += product.quantity;
      }
    });
    
    return Object.entries(storageAreas).map(([area, quantity]) => ({ area, quantity }));
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