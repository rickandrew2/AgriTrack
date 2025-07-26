import React from 'react';
import InventoryDistributionChart from './charts/InventoryDistributionChart';
import TransactionActivityChart from './charts/TransactionActivityChart';
import LowStockAlertChart from './charts/LowStockAlertChart';
import StorageUtilizationChart from './charts/StorageUtilizationChart';

const ChartsSection = ({ dashboardStats, loading, error }) => {
  if (loading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Analytics</h3>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">Error loading charts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-green-800 mb-4">Analytics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryDistributionChart dashboardStats={dashboardStats} />
        <TransactionActivityChart dashboardStats={dashboardStats} />
        <LowStockAlertChart dashboardStats={dashboardStats} />
        <StorageUtilizationChart dashboardStats={dashboardStats} />
      </div>
    </div>
  );
};

export default ChartsSection; 