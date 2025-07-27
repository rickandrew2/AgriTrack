import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SideNavigation from './SideNavigation';
import Dashboard from '../pages/dashboard';
import Products from '../pages/products';
import Reports from '../pages/reports';
import History from '../pages/history';
import UserManagement from '../pages/usermanagement';
import InactivityTimer from './InactivityTimer';

const Layout = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('User');
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info from localStorage and validate
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      // No token or user data, redirect to login
      navigate('/', { replace: true });
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUserRole(userData?.role?.toLowerCase());
      
      if (userData?.name) {
        const nameParts = userData.name.trim().split(' ');
        setUserName(nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0]);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      // Invalid user data, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Set active tab based on current URL
  useEffect(() => {
    const path = location.pathname;
    let newTab = 'dashboard';
    
    switch (path) {
      case '/dashboard':
        newTab = 'dashboard';
        break;
      case '/products':
        newTab = 'product';
        break;
      case '/reports':
        newTab = 'report';
        break;
      case '/history':
        newTab = 'history';
        break;
      case '/usermanagement':
        newTab = 'usermanagement';
        break;
      default:
        newTab = 'dashboard';
    }
    
    // Only update if the tab actually changed to prevent unnecessary re-renders
    if (activeTab !== newTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/', { replace: true });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Navigate to the corresponding URL
    switch (tabId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'product':
        navigate('/products');
        break;
      case 'report':
        navigate('/reports');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'usermanagement':
        navigate('/usermanagement');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'product':
        return <Products />;
      case 'report':
        return <Reports />;
      case 'history':
        return <History />;
      case 'usermanagement':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Inactivity Timer */}
      <InactivityTimer />
      
      {/* Side Navigation */}
      <SideNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 overflow-y-auto">
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div></div> {/* Empty div for spacing */}
            
            {/* Profile Section */}
            <div className="flex items-center space-x-3">
              {/* Admin Button - Only show for admin users */}
              {userRole === 'admin' && (
                <div className="flex flex-col items-center">
                  <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <span className="text-xs text-gray-600 mt-1 font-medium">ADMIN</span>
                </div>
              )}
              
              {/* Logout Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLogoutClick}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
                <span className="text-xs text-gray-600 mt-1 font-medium">LOGOUT</span>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>

      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
                  <p className="text-green-100 text-sm">Are you sure you want to logout?</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                You will be logged out of your account and redirected to the login page. Any unsaved changes will be lost.
              </p>
              
              {/* Modal Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelLogout}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout; 