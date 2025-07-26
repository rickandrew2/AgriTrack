import React from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  DocumentChartBarIcon, 
  ArchiveBoxIcon,
  CloudArrowUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png';

const SideNavigation = ({ activeTab, onTabChange }) => {
  // Get user role from localStorage
  let userRole = null;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    userRole = user?.role?.toLowerCase();
  } catch (e) {
    userRole = null;
  }

  const navigationItems = [
    { id: 'dashboard', name: 'DASHBOARD', icon: ChartBarIcon },
    { id: 'product', name: 'PRODUCT', icon: CubeIcon },
    { id: 'report', name: 'REPORT', icon: DocumentChartBarIcon },
    { id: 'history', name: 'HISTORY', icon: ArchiveBoxIcon },
    // Only show user management for admin
    ...(userRole === 'admin' ? [{ id: 'usermanagement', name: 'USER MANAGEMENT', icon: UsersIcon }] : [])
  ];

  return (
    <div className="w-64 min-h-screen flex flex-col justify-between bg-green-700/100 backdrop-blur-xl shadow-2xl rounded-r-3xl border-r border-green-300/30">
      <div>
        <div className="flex flex-col items-center pt-8 pb-2">
          <h1 className="text-white text-2xl font-extrabold tracking-widest drop-shadow-lg text-center">ADMIN</h1>
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-8 py-4 text-left rounded-l-full transition-all duration-300 group relative overflow-hidden
                  ${isActive
                    ? 'bg-green-100/80 text-green-900 shadow-lg border-l-4 border-green-400 scale-[1.03]'
                    : 'text-green-100 hover:bg-green-700/60 hover:scale-105 hover:text-green-50'}
                `}
                style={{ boxShadow: isActive ? '0 4px 24px 0 rgba(34,197,94,0.15)' : undefined }}
              >
                <span className={`absolute left-0 top-0 h-full w-1 bg-green-400 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}></span>
                <Icon className={`w-6 h-6 mr-4 group-hover:scale-110 transition-transform duration-200 ${isActive ? 'text-green-600' : ''}`} />
                <span className={`font-semibold tracking-wide text-base ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col items-center pb-8 pt-4">
        <img src={logo} alt="Logo" className="w-20 h-20 object-contain rounded-full shadow-lg border-4 border-green-200 bg-white p-2" />
      </div>
    </div>
  );
};

export default SideNavigation; 