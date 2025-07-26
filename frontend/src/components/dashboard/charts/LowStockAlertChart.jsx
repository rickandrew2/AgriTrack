import React from 'react';
import { ExclamationTriangleIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const LowStockAlertChart = ({ dashboardStats }) => {
  // Get low stock products (quantity < 10)
  const getLowStockProducts = () => {
    if (!dashboardStats?.allProducts) {
      console.log('LowStockAlertChart: No allProducts data available');
      return [];
    }
    
    console.log('LowStockAlertChart: allProducts count:', dashboardStats.allProducts.length);
    console.log('LowStockAlertChart: Sample products:', dashboardStats.allProducts.slice(0, 3));
    
    // Use actual product stock levels instead of transaction data
    const lowStockProducts = dashboardStats.allProducts
      .filter(product => product.quantity < 15) // Low stock threshold
      .map(product => ({
        name: product.name,
        quantity: product.quantity,
        category: product.category
      }))
      .sort((a, b) => a.quantity - b.quantity) // Sort by quantity (lowest first)
      .slice(0, 8); // Show top 8 low stock items
    
    console.log('LowStockAlertChart: Low stock products found:', lowStockProducts.length);
    return lowStockProducts;
  };

  const lowStockProducts = getLowStockProducts();

  const getStockLevelColor = (quantity) => {
    if (quantity <= 2) return 'text-red-600 bg-red-50 border-red-200';
    if (quantity <= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getStockLevelText = (quantity) => {
    if (quantity <= 2) return 'Critical';
    if (quantity <= 5) return 'Low';
    return 'Warning';
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800">Low Stock Alerts</h3>
        {lowStockProducts.length > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            {lowStockProducts.length} {lowStockProducts.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        )}
      </div>
      
      <div className="h-64 overflow-y-auto">
        {lowStockProducts.length > 0 ? (
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getStockLevelColor(product.quantity)} hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{product.quantity}</span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80">
                        {getStockLevelText(product.quantity)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">units left</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 font-medium">No Low Stock Alerts</p>
            <p className="text-gray-500 text-sm mt-1">All products have sufficient stock levels</p>
          </div>
        )}
      </div>
      
      {lowStockProducts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <ArrowUpIcon className="w-4 h-4 mr-1" />
            <span>Consider restocking these items soon</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlertChart; 