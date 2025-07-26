import React, { useState, useEffect } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon, CalendarIcon, ChartBarIcon, CurrencyDollarIcon, CogIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const reportsPerPage = 5;

  const reportTypes = [
    { 
      id: 'inventory', 
      name: 'Inventory Report', 
      description: 'Current stock levels and distribution',
      icon: DocumentChartBarIcon,
      color: 'bg-blue-500'
    },
    { 
      id: 'transactions', 
      name: 'Transaction Report', 
      description: 'All incoming and outgoing transactions',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
  ];

  const filterOptions = [
    { value: '1week', label: 'Last week' },
    { value: '30days', label: 'Last 30 days' },
    { value: '6months', label: 'Last 6 months' },
    { value: 'all', label: 'All time' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
  ];

  useEffect(() => {
    // Simulate loading reports data
    const timer = setTimeout(() => {
      setLoading(false);
      setReports([
        { id: 1, name: 'Monthly Inventory Report', date: '2024-01-15', type: 'inventory', status: 'completed', size: '2.3 MB' },
        { id: 2, name: 'Weekly Transaction Summary', date: '2024-01-14', type: 'transactions', status: 'completed', size: '1.8 MB' },
        { id: 3, name: 'Performance Analytics', date: '2024-01-13', type: 'performance', status: 'pending', size: '3.1 MB' },
        { id: 4, name: 'System Audit Log', date: '2024-01-12', type: 'audit', status: 'completed', size: '4.2 MB' },
        { id: 5, name: 'Quarterly Sales Report', date: '2024-01-10', type: 'transactions', status: 'completed', size: '5.7 MB' },
        { id: 6, name: 'Storage Utilization Report', date: '2024-01-08', type: 'inventory', status: 'completed', size: '1.5 MB' },
        { id: 7, name: 'Annual Performance Review', date: '2023-12-28', type: 'performance', status: 'completed', size: '8.9 MB' },
        { id: 8, name: 'December Transaction Log', date: '2023-12-25', type: 'transactions', status: 'completed', size: '4.1 MB' },
        { id: 9, name: 'Year-End Inventory Count', date: '2023-12-20', type: 'inventory', status: 'completed', size: '6.2 MB' },
        { id: 10, name: 'System Security Audit', date: '2023-12-15', type: 'audit', status: 'completed', size: '3.8 MB' },
        { id: 11, name: 'November Analytics Report', date: '2023-11-30', type: 'performance', status: 'completed', size: '7.3 MB' },
        { id: 12, name: 'Monthly Revenue Summary', date: '2023-11-25', type: 'transactions', status: 'completed', size: '2.9 MB' },
        { id: 13, name: 'Processing Report', date: '2024-01-16', type: 'performance', status: 'processing', size: '1.2 MB' },
        { id: 14, name: 'Pending Inventory Check', date: '2024-01-17', type: 'inventory', status: 'pending', size: '0.8 MB' },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter reports based on search term, status, and date period
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    // Date filtering logic
    const reportDate = new Date(report.date);
    const now = new Date();
    const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
    
    let matchesDate = true;
    switch (filterPeriod) {
      case '1week':
        matchesDate = daysDiff <= 7;
        break;
      case '30days':
        matchesDate = daysDiff <= 30;
        break;
      case '6months':
        matchesDate = daysDiff <= 180;
        break;
      case 'all':
        matchesDate = true;
        break;
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter) => {
    setFilterPeriod(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-green-800 mb-2">REPORTS</h1>
            <p className="text-gray-600">Generate and manage your system reports</p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <DocumentChartBarIcon className="w-5 h-5" />
            <span className="font-medium">Generate Report</span>
          </button>
        </div>

        {/* Report Type Selection Cards */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
          <h2 className="text-2xl font-bold text-green-800 mb-6">REPORTS</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id)}
                  className={`group relative w-80 h-48 p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-md hover:scale-105 ${
                    selectedReport === type.id
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-16 h-16 ${type.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-2xl">{type.name}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{type.description}</p>
                  {selectedReport === type.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reports List Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Recent Reports</h3>
              <p className="text-gray-600">Your latest generated reports</p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 space-y-4">
            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Period Filters */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filterPeriod === option.value
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
            </p>
            {filteredReports.length > 0 && (
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">No reports found</h4>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentReports.map((report) => (
                  <div
                    key={report.id}
                    className="group flex items-center justify-between p-6 border border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-white transition-all duration-300 hover:shadow-lg hover:border-green-200"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DocumentChartBarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg mb-1">{report.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Generated on {report.date}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <button className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 transition-colors duration-200">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Report Preview Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-green-800">Report Preview</h3>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-green-600 hover:text-green-800 font-medium">Export PDF</button>
              <button className="px-4 py-2 text-green-600 hover:text-green-800 font-medium">Export Excel</button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">No Preview Available</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Select a report type above to generate a detailed preview of your data and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 