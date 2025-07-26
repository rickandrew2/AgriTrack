import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  DocumentChartBarIcon, 
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

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

  const statCards = [
    { title: 'Total Products', value: '1,234', change: '+12%', color: 'bg-emerald-500' },
    { title: 'Low Stock', value: '23', change: '-5%', color: 'bg-amber-500' },
    { title: 'Revenue', value: '$45,678', change: '+8%', color: 'bg-blue-500' },
    { title: 'Orders', value: '89', change: '+15%', color: 'bg-purple-500' },
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
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                EXPORT TO EXCEL
              </button>
              <button className="flex items-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                IMPORT TO EXCEL
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-xl font-semibold text-green-800 mb-4">CHART</h3>
              <div className="h-64 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-dashed border-green-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mb-4">
                    <ChartBarIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-600 font-medium">Chart visualization will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Recent Transactions</h3>
            <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <DocumentChartBarIcon className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-600 font-medium">Data table will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;