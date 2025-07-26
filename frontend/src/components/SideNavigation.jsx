import React from 'react';
import { 
  ChartBarIcon, 
  CubeIcon, 
  DocumentChartBarIcon, 
  ArchiveBoxIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const SideNavigation = ({ activeTab, onTabChange }) => {
  const navigationItems = [
    { id: 'dashboard', name: 'DASHBOARD', icon: ChartBarIcon },
    { id: 'product', name: 'PRODUCT', icon: CubeIcon },
    { id: 'report', name: 'REPORT', icon: DocumentChartBarIcon },
    { id: 'history', name: 'HISTORY', icon: ArchiveBoxIcon },
    { id: 'backup', name: 'BACKUP', icon: CloudArrowUpIcon },
  ];

  return (
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
              onClick={() => onTabChange(item.id)}
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
  );
};

export default SideNavigation; 