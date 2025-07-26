import React, { useState, useEffect } from 'react';
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  CloudArrowUpIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        // Simulate loading backup data
        const timer = setTimeout(() => {
          setLoading(false);
          setBackups([
            {
              id: 1,
              name: 'Full System Backup',
              date: '2024-01-15T10:30:00',
              size: '2.5 GB',
              type: 'full',
              status: 'completed',
              description: 'Complete system backup including all data and configurations'
            },
            {
              id: 2,
              name: 'Database Backup',
              date: '2024-01-14T15:45:00',
              size: '1.2 GB',
              type: 'database',
              status: 'completed',
              description: 'Database backup with all transactions and user data'
            },
            {
              id: 3,
              name: 'Configuration Backup',
              date: '2024-01-13T09:15:00',
              size: '150 MB',
              type: 'config',
              status: 'completed',
              description: 'System configuration and settings backup'
            },
            {
              id: 4,
              name: 'Scheduled Backup',
              date: '2024-01-12T23:00:00',
              size: '2.1 GB',
              type: 'full',
              status: 'failed',
              description: 'Automated daily backup - failed due to insufficient space'
            }
          ]);
        }, 1000);

        return () => clearTimeout(timer);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching backups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: Date.now(),
        name: `Manual Backup ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        size: '2.3 GB',
        type: 'full',
        status: 'completed',
        description: 'Manual backup created by user'
      };
      
      setBackups(prev => [newBackup, ...prev]);
    } catch (err) {
      setError('Failed to create backup');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-yellow-600 animate-spin" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'database':
        return 'bg-green-100 text-green-800';
      case 'config':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">BACKUP & RESTORE</h1>
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
        </button>
      </div>

      {/* Backup Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Total Backups</h3>
          <p className="text-3xl font-bold text-gray-800">{backups.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Last Backup</h3>
          <p className="text-lg font-bold text-gray-800">
            {backups.length > 0 ? new Date(backups[0].date).toLocaleDateString() : 'Never'}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Total Size</h3>
          <p className="text-3xl font-bold text-gray-800">
            {backups.reduce((total, backup) => {
              const size = parseFloat(backup.size);
              return total + size;
            }, 0).toFixed(1)} GB
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-gray-800">
            {backups.length > 0 
              ? Math.round((backups.filter(b => b.status === 'completed').length / backups.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-xl font-semibold text-green-800 mb-6">Backup History</h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {backups.length > 0 ? (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(backup.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{backup.name}</h4>
                      <p className="text-sm text-gray-600">{backup.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(backup.date).toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                          {backup.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{backup.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="text-green-600 hover:text-green-800" title="Download">
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800" title="Restore">
                      <ArrowUpTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No backups found</p>
                <p className="text-gray-500 text-sm">Create your first backup to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup Settings */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Backup Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Backup Schedule
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Retention
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
