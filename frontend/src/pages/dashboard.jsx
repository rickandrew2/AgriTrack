import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  DocumentChartBarIcon, 
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import ChartsSection from '../components/dashboard/ChartsSection';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    window.location.href = '/';
  };

  const navigationItems = [
    { id: 'dashboard', name: 'DASHBOARD', icon: ChartBarIcon },
    { id: 'product', name: 'PRODUCT', icon: CubeIcon },
    { id: 'report', name: 'REPORT', icon: DocumentChartBarIcon },
    { id: 'history', name: 'HISTORY', icon: ArchiveBoxIcon },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        console.log('Dashboard API Response:', data);
        console.log('Response keys:', Object.keys(data));
        console.log('All Products:', data.allProducts);
        console.log('All Products type:', typeof data.allProducts);
        console.log('All Products length:', data.allProducts?.length);
        console.log('Recent Transactions:', data.recentTransactions);
        setDashboardStats(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { 
      title: 'Total Seeds', 
      value: dashboardStats?.totalSeeds?.value ? dashboardStats.totalSeeds.value.toLocaleString() : '0', 
      change: dashboardStats?.totalSeeds?.change || '+0%', 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Total Seedlings', 
      value: dashboardStats?.totalSeedlings?.value ? dashboardStats.totalSeedlings.value.toLocaleString() : '0', 
      change: dashboardStats?.totalSeedlings?.change || '+0%', 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Total Dispatch Items', 
      value: dashboardStats?.totalDispatchItems?.value ? dashboardStats.totalDispatchItems.value.toLocaleString() : '0', 
      change: dashboardStats?.totalDispatchItems?.change || '+0%', 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Remaining Stock', 
      value: dashboardStats?.remainingStock?.value ? dashboardStats.remainingStock.value.toLocaleString() : '0', 
      change: dashboardStats?.remainingStock?.change || '+0%', 
      color: 'bg-purple-500' 
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-green-800 to-green-900 shadow-2xl backdrop-blur-sm">
        <div className="p-6">
          <h1 className="text-white text-xl font-bold tracking-wider">ADMIN</h1>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-green-600/80 backdrop-blur-sm shadow-lg border-r-4 border-green-400'
                    : 'text-green-100 hover:bg-green-700/50 hover:backdrop-blur-sm'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium tracking-wide">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">INVENTORY REPORT</h1>
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm border border-green-500/20">
                <h2 className="text-4xl font-bold text-white mb-1">WELCOME BACK, Morales</h2>
                <p className="text-green-100 text-sm italic">Here what's happen to you naging dellulu ka pero najan na ang update</p>
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full shadow-lg"></div>
              <div className="w-24 h-8 bg-green-500 rounded-full shadow-lg"></div>
              <span className="text-green-700 font-medium">Profile</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overview Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Overview</h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl shadow-lg"></div>
                      <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-600 font-medium">Error loading dashboard data: {error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${card.color} rounded-xl shadow-lg flex items-center justify-center`}>
                        <div className="w-6 h-6 bg-white rounded-md"></div>
                      </div>
                      <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {card.change}
                      </span>
                    </div>
                    <h4 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h4>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Section */}
          <ChartsSection 
            dashboardStats={dashboardStats} 
            loading={loading} 
            error={error} 
          />

          {/* Data Table Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Recent Transactions</h3>
            {loading ? (
              <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 animate-spin">
                    <DocumentChartBarIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-600 font-medium">Loading transactions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-dashed border-red-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mb-4">
                    <DocumentChartBarIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">Error loading data: {error}</p>
                </div>
              </div>
            ) : dashboardStats?.recentTransactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.recentTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">
                          {transaction.productId?.name || 'Unknown Product'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'dispatch' ? 'bg-red-100 text-red-800' :
                            transaction.type === 'add' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">{transaction.quantity}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {transaction.userId?.name || 'Unknown User'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <DocumentChartBarIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-600 font-medium">No transactions found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;