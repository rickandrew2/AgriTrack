import React, { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('inventory');

  const reportTypes = [
    { id: 'inventory', name: 'Inventory Report', description: 'Current stock levels and distribution' },
    { id: 'transactions', name: 'Transaction Report', description: 'All incoming and outgoing transactions' },
    { id: 'performance', name: 'Performance Report', description: 'System performance and analytics' },
    { id: 'audit', name: 'Audit Report', description: 'System audit trail and logs' },
  ];

  useEffect(() => {
    // Simulate loading reports data
    const timer = setTimeout(() => {
      setLoading(false);
      setReports([
        { id: 1, name: 'Monthly Inventory Report', date: '2024-01-15', type: 'inventory', status: 'completed' },
        { id: 2, name: 'Weekly Transaction Summary', date: '2024-01-14', type: 'transactions', status: 'completed' },
        { id: 3, name: 'Performance Analytics', date: '2024-01-13', type: 'performance', status: 'pending' },
        { id: 4, name: 'System Audit Log', date: '2024-01-12', type: 'audit', status: 'completed' },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">REPORTS</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
          <DocumentChartBarIcon className="w-5 h-5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedReport(type.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedReport === type.id
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="text-left">
              <h3 className="font-semibold text-gray-800 mb-1">{type.name}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-green-800">Recent Reports</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>

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
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DocumentChartBarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{report.name}</h4>
                    <p className="text-sm text-gray-600">Generated on {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <button className="text-green-600 hover:text-green-800">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Preview */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Report Preview</h3>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a report type above to generate a preview</p>
        </div>
      </div>
    </div>
  );
};

export default Reports; 