import React, { useState } from 'react';
import SideNavigation from './SideNavigation';
import Dashboard from '../pages/dashboard';
import Products from '../pages/products';
import Reports from '../pages/reports';
import History from '../pages/history';

const Layout = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'product':
        return <Products />;
      case 'report':
        return <Reports />;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Navigation */}
      <SideNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 overflow-y-auto">
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div></div> {/* Empty div for spacing */}
            
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

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Layout; 