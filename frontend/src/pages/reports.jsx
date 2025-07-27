import React, { useState, useEffect, useRef } from 'react';
import { DocumentChartBarIcon, ArrowDownTrayIcon, CalendarIcon, ChartBarIcon, CurrencyDollarIcon, CogIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { buildApiUrl } from '../config/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [filterPeriod, setFilterPeriod] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentReportData, setCurrentReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    storageAreas: [],
    users: [],
    products: [],
    transactionTypes: []
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    storageArea: '',
    type: '',
    userId: '',
    productId: ''
  });
  const reportsPerPage = 5;
  
  // Refs for PDF export
  const reportRef = useRef(null);

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

  const periodFilterOptions = [
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
    fetchFilterOptions();
    fetchRecentReports();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(buildApiUrl('/reports/filter-options'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchRecentReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/reports/recent'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        setReports([]);
      }
    } catch (error) {
      setReports([]);
      console.error('Error fetching recent reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters based on selected report type
      if (selectedReport === 'inventory') {
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.storageArea) queryParams.append('storageArea', filters.storageArea);
      } else if (selectedReport === 'transactions') {
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.productId) queryParams.append('productId', filters.productId);
      }

      const response = await fetch(buildApiUrl(`/reports/${selectedReport}?${queryParams}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentReportData(data);
        
        // Refresh the reports list to get the latest data from backend
        await fetchRecentReports();
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

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
    // Use summary or type for search
    const name = report.summary || report.type || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    // No status field in backend, so always true
    const matchesStatus = true;
    // Date filtering logic
    const reportDate = new Date(report.generatedAt);
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
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleFilterUpdate = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Generate descriptive summary for inventory report
  const generateInventorySummary = (data) => {
    if (!data || !data.summary) return '';

    const { totalProducts, totalQuantity, lowStockCount, outOfStockCount } = data.summary;
    const hasAlerts = lowStockCount > 0 || outOfStockCount > 0;
    
    let summary = `This inventory report provides a comprehensive overview of your current stock levels as of ${new Date(data.generatedAt).toLocaleDateString()}. `;
    
    summary += `Your inventory currently contains ${totalProducts} active products with a total of ${totalQuantity} units across all categories. `;
    
    if (data.categoryStats && Object.keys(data.categoryStats).length > 0) {
      const topCategory = Object.entries(data.categoryStats)
        .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)[0];
      summary += `The ${topCategory[0]} category represents the largest portion of your inventory with ${topCategory[1].totalQuantity} units. `;
    }
    
    if (data.storageStats && Object.keys(data.storageStats).length > 0) {
      const topStorage = Object.entries(data.storageStats)
        .sort(([,a], [,b]) => b.totalQuantity - a.totalQuantity)[0];
      summary += `Most of your inventory is stored in ${topStorage[0]} with ${topStorage[1].totalQuantity} units. `;
    }
    
    if (hasAlerts) {
      summary += `Please note that there ${outOfStockCount === 1 ? 'is' : 'are'} ${outOfStockCount} item${outOfStockCount !== 1 ? 's' : ''} currently out of stock, and ${lowStockCount} item${lowStockCount !== 1 ? 's' : ''} ${lowStockCount === 1 ? 'is' : 'are'} running low on stock. We recommend reviewing these items for potential restocking. `;
    } else {
      summary += `Great news! All items are currently in stock with no critical shortages. Your inventory is well-maintained. `;
    }
    
    summary += `This report serves as a valuable tool for inventory planning and decision-making.`;
    
    return summary;
  };

  // Generate descriptive summary for transaction report
  const generateTransactionSummary = (data) => {
    if (!data || !data.summary) return '';

    const { totalTransactions, dispatchCount, addCount, updateCount, totalDispatchQuantity, totalAddQuantity, totalUpdateQuantity } = data.summary;
    
    let summary = `This transaction report provides insights into system activities and inventory movements as of ${new Date(data.generatedAt).toLocaleDateString()}. `;
    
    summary += `A total of ${totalTransactions} transactions have been recorded, demonstrating active inventory management. `;
    
    if (totalTransactions > 0) {
      const mostActiveType = dispatchCount > addCount && dispatchCount > updateCount ? 'dispatch' :
                           addCount > updateCount ? 'add' : 'update';
      const mostActiveCount = Math.max(dispatchCount, addCount, updateCount);
      
      summary += `The most frequent activity type is ${mostActiveType} with ${mostActiveCount} transactions. `;
      
      if (data.userStats && data.userStats.length > 0) {
        const topUser = data.userStats[0];
        summary += `${topUser.user?.name || 'A user'} has been the most active participant with ${topUser.total} transactions. `;
      }
      
      summary += `In terms of quantities, ${totalAddQuantity} units have been added to inventory, ${totalDispatchQuantity} units have been dispatched, and ${totalUpdateQuantity} units have been updated. `;
    }
    
    if (data.allTransactions && data.allTransactions.length > 0) {
      const recentDate = new Date(data.allTransactions[0].timestamp).toLocaleDateString();
      summary += `The most recent activity occurred on ${recentDate}, showing ongoing system engagement. `;
    }
    
    summary += `This report helps track operational efficiency and user activity patterns within your inventory management system.`;
    
    return summary;
  };

  // Generate PDF preview
  const generatePDFPreview = async () => {
    if (!currentReportData || !currentReportData.summary) {
      alert('No report data available to export');
      return;
    }

    setExportingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 35; // Increased from 20 to 35 for better spacing
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = 40; // Increased from 30 to 40 for better top spacing

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 50) { // Increased bottom margin from 40 to 50
          pdf.addPage();
          yPosition = 40; // Updated to match new starting position
          return true;
        }
        return false;
      };

      // Header with government branding
      pdf.setFillColor(34, 139, 34); // Green background
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DEPARTMENT OF AGRICULTURE', pageWidth / 2, 12, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('AGRICULTURAL INVENTORY MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });

      // Report title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const reportTitle = `${selectedReport === 'inventory' ? 'INVENTORY' : 'TRANSACTION'} STATUS REPORT`;
      pdf.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Report period
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report Period: ${new Date(currentReportData.generatedAt).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Executive Summary
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const summary = selectedReport === 'inventory' 
        ? generateInventorySummary(currentReportData)
        : generateTransactionSummary(currentReportData);
      
      const summaryLines = pdf.splitTextToSize(summary, contentWidth);
      checkPageBreak(summaryLines.length * 5 + 20);
      pdf.text(summaryLines, margin, yPosition);
      yPosition += (summaryLines.length * 5) + 15;

      if (selectedReport === 'inventory') {
        // Key Metrics Table
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KEY PERFORMANCE INDICATORS', margin, yPosition);
        yPosition += 15;

        // Create metrics table
        const metrics = [
          ['Metric', 'Value', 'Status'],
          ['Total Products', currentReportData.summary.totalProducts.toString(), 'Active'],
          ['Total Quantity', currentReportData.summary.totalQuantity.toString(), 'Available'],
          ['Low Stock Items', currentReportData.summary.lowStockCount.toString(), 'Requires Attention'],
          ['Out of Stock Items', currentReportData.summary.outOfStockCount.toString(), 'Critical']
        ];

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        // Table headers
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        pdf.text('Metric', margin + 5, yPosition);
        pdf.text('Value', margin + 80, yPosition);
        pdf.text('Status', margin + 120, yPosition);
        yPosition += 8;

        // Table rows
        pdf.setFont('helvetica', 'normal');
        for (let i = 1; i < metrics.length; i++) {
          pdf.text(metrics[i][0], margin + 5, yPosition);
          pdf.text(metrics[i][1], margin + 80, yPosition);
          
          // Color code status
          if (metrics[i][2] === 'Critical') {
            pdf.setTextColor(220, 53, 69); // Red
          } else if (metrics[i][2] === 'Requires Attention') {
            pdf.setTextColor(255, 193, 7); // Yellow
          } else {
            pdf.setTextColor(40, 167, 69); // Green
          }
          pdf.text(metrics[i][2], margin + 120, yPosition);
          pdf.setTextColor(0, 0, 0); // Reset to black
          yPosition += 6;
        }
        yPosition += 15;

        // Category Distribution
        if (currentReportData.categoryStats && Object.keys(currentReportData.categoryStats).length > 0) {
          checkPageBreak(50);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CATEGORY DISTRIBUTION', margin, yPosition);
          yPosition += 15;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
          pdf.text('Category', margin + 5, yPosition);
          pdf.text('Products', margin + 80, yPosition);
          pdf.text('Total Units', margin + 120, yPosition);
          yPosition += 8;

          pdf.setFont('helvetica', 'normal');
          Object.entries(currentReportData.categoryStats).forEach(([category, stats]) => {
            pdf.text(category, margin + 5, yPosition);
            pdf.text(stats.count.toString(), margin + 80, yPosition);
            pdf.text(stats.totalQuantity.toString(), margin + 120, yPosition);
            yPosition += 6;
          });
          yPosition += 15;
        }

        // Storage Area Distribution
        if (currentReportData.storageStats && Object.keys(currentReportData.storageStats).length > 0) {
          checkPageBreak(50);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('STORAGE AREA UTILIZATION', margin, yPosition);
          yPosition += 15;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
          pdf.text('Storage Area', margin + 5, yPosition);
          pdf.text('Products', margin + 80, yPosition);
          pdf.text('Total Units', margin + 120, yPosition);
          yPosition += 8;

          pdf.setFont('helvetica', 'normal');
          Object.entries(currentReportData.storageStats).forEach(([area, stats]) => {
            pdf.text(area, margin + 5, yPosition);
            pdf.text(stats.count.toString(), margin + 80, yPosition);
            pdf.text(stats.totalQuantity.toString(), margin + 120, yPosition);
            yPosition += 6;
          });
          yPosition += 15;
        }

        // Critical Alerts Section
        if ((currentReportData.lowStockProducts && currentReportData.lowStockProducts.length > 0) || 
            (currentReportData.outOfStockProducts && currentReportData.outOfStockProducts.length > 0)) {
          checkPageBreak(50);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('CRITICAL ALERTS', margin, yPosition);
          yPosition += 15;

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          
          if (currentReportData.outOfStockProducts && currentReportData.outOfStockProducts.length > 0) {
            pdf.setTextColor(220, 53, 69); // Red
            pdf.text('OUT OF STOCK ITEMS:', margin, yPosition);
            yPosition += 6;
            currentReportData.outOfStockProducts.forEach(product => {
              pdf.text(`• ${product.name} (${product.category})`, margin + 10, yPosition);
              yPosition += 5;
            });
            yPosition += 5;
          }

          if (currentReportData.lowStockProducts && currentReportData.lowStockProducts.length > 0) {
            pdf.setTextColor(255, 193, 7); // Yellow
            pdf.text('LOW STOCK ITEMS:', margin, yPosition);
            yPosition += 6;
            currentReportData.lowStockProducts.forEach(product => {
              pdf.text(`• ${product.name} (${product.category}) - ${product.quantity} units remaining`, margin + 10, yPosition);
              yPosition += 5;
            });
            yPosition += 5;
          }
          pdf.setTextColor(0, 0, 0); // Reset to black
        }
      } else {
        // Transaction Report specific content
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TRANSACTION SUMMARY', margin, yPosition);
        yPosition += 15;

        const transactionMetrics = [
          ['Transaction Type', 'Count', 'Total Quantity'],
          ['Dispatch', currentReportData.summary.dispatchCount.toString(), currentReportData.summary.totalDispatchQuantity.toString()],
          ['Add', currentReportData.summary.addCount.toString(), currentReportData.summary.totalAddQuantity.toString()],
          ['Update', currentReportData.summary.updateCount.toString(), currentReportData.summary.totalUpdateQuantity.toString()]
        ];

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        pdf.text('Transaction Type', margin + 5, yPosition);
        pdf.text('Count', margin + 80, yPosition);
        pdf.text('Total Quantity', margin + 120, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        for (let i = 1; i < transactionMetrics.length; i++) {
          pdf.text(transactionMetrics[i][0], margin + 5, yPosition);
          pdf.text(transactionMetrics[i][1], margin + 80, yPosition);
          pdf.text(transactionMetrics[i][2], margin + 120, yPosition);
          yPosition += 6;
        }
        yPosition += 15;

        // User Activity Summary
        if (currentReportData.userStats && currentReportData.userStats.length > 0) {
          checkPageBreak(50);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text('USER ACTIVITY SUMMARY', margin, yPosition);
          yPosition += 15;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
          pdf.text('User', margin + 5, yPosition);
          pdf.text('Total Activities', margin + 80, yPosition);
          pdf.text('Breakdown', margin + 120, yPosition);
          yPosition += 8;

          pdf.setFont('helvetica', 'normal');
          currentReportData.userStats.slice(0, 5).forEach(userStat => {
            pdf.text(userStat.user?.name || 'Unknown User', margin + 5, yPosition);
            pdf.text(userStat.total.toString(), margin + 80, yPosition);
            const breakdown = `${userStat.dispatch}D/${userStat.add}A/${userStat.update}U`;
            pdf.text(breakdown, margin + 120, yPosition);
            yPosition += 6;
          });
        }
      }

      // Check if we need a new page for footer
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      // Footer
      yPosition = pageHeight - 30;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text('This report is generated by the Agricultural Inventory Management System', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      pdf.text('For official use only - Department of Agriculture', pageWidth / 2, yPosition, { align: 'center' });

      // Store PDF data for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfData({ url: pdfUrl, blob: pdfBlob, fileName: `${selectedReport}_status_report_${new Date().toISOString().split('T')[0]}.pdf` });
      setShowPDFPreview(true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  // Download PDF
  const downloadPDF = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData.url;
      link.download = pdfData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Close PDF preview
  const closePDFPreview = () => {
    setShowPDFPreview(false);
    if (pdfData?.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData(null);
  };

  const renderInventoryReport = () => {
    if (!currentReportData || !currentReportData.summary) return null;

    return (
      <div className="space-y-6">
        {/* Descriptive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <DocumentChartBarIcon className="w-5 h-5 mr-2" />
            Executive Summary
          </h4>
          <p className="text-blue-900 leading-relaxed">
            {generateInventorySummary(currentReportData)}
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold">{currentReportData.summary.totalProducts || 0}</p>
                <p className="text-blue-100 text-xs mt-1">Active items in inventory</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Quantity</p>
                <p className="text-3xl font-bold">{currentReportData.summary.totalQuantity || 0}</p>
                <p className="text-green-100 text-xs mt-1">Units across all products</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold">{currentReportData.summary.lowStockCount || 0}</p>
                <p className="text-yellow-100 text-xs mt-1">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                <p className="text-3xl font-bold">{currentReportData.summary.outOfStockCount || 0}</p>
                <p className="text-red-100 text-xs mt-1">Requires immediate action</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Category Distribution
            </h4>
            {currentReportData.categoryStats && Object.keys(currentReportData.categoryStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(currentReportData.categoryStats).map(([category, stats]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{category}</p>
                      <p className="text-sm text-gray-600">{stats.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{stats.totalQuantity}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            )}
          </div>

          {/* Storage Area Utilization */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CogIcon className="w-5 h-5 mr-2 text-green-600" />
              Storage Area Utilization
            </h4>
            {currentReportData.storageStats && Object.keys(currentReportData.storageStats).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(currentReportData.storageStats).map(([area, stats]) => (
                  <div key={area} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{area}</p>
                      <p className="text-sm text-gray-600">{stats.count} products</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{stats.totalQuantity}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No storage area data available</p>
            )}
          </div>
        </div>

        {/* Critical Alerts */}
        {(currentReportData.lowStockProducts && currentReportData.lowStockProducts.length > 0) || 
         (currentReportData.outOfStockProducts && currentReportData.outOfStockProducts.length > 0) ? (
          <div className="bg-white p-6 rounded-xl shadow-md border border-red-200">
            <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Critical Alerts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentReportData.outOfStockProducts && currentReportData.outOfStockProducts.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h5 className="font-semibold text-red-800 mb-2">Out of Stock ({currentReportData.outOfStockProducts.length})</h5>
                  <div className="space-y-1">
                    {currentReportData.outOfStockProducts.slice(0, 3).map((product, index) => (
                      <p key={product._id || `out-of-stock-${index}`} className="text-sm text-red-700">• {product.name}</p>
                    ))}
                    {currentReportData.outOfStockProducts.length > 3 && (
                      <p className="text-sm text-red-600">+{currentReportData.outOfStockProducts.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
              
              {currentReportData.lowStockProducts && currentReportData.lowStockProducts.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-semibold text-yellow-800 mb-2">Low Stock ({currentReportData.lowStockProducts.length})</h5>
                  <div className="space-y-1">
                    {currentReportData.lowStockProducts.slice(0, 3).map((product, index) => (
                      <p key={product._id || `low-stock-${index}`} className="text-sm text-yellow-700">• {product.name} ({product.quantity} left)</p>
                    ))}
                    {currentReportData.lowStockProducts.length > 3 && (
                      <p className="text-sm text-yellow-600">+{currentReportData.lowStockProducts.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center justify-center text-green-800">
              <CheckCircleIcon className="w-8 h-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">All Systems Normal</h4>
                <p className="text-sm text-green-600">No critical inventory alerts at this time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTransactionReport = () => {
    if (!currentReportData || !currentReportData.summary) return null;

    return (
      <div className="space-y-6">
        {/* Descriptive Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
            <DocumentChartBarIcon className="w-5 h-5 mr-2" />
            Executive Summary
          </h4>
          <p className="text-green-900 leading-relaxed">
            {generateTransactionSummary(currentReportData)}
          </p>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
                <p className="text-3xl font-bold">{currentReportData.summary.totalTransactions || 0}</p>
                <p className="text-blue-100 text-xs mt-1">System activities recorded</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Dispatch</p>
                <p className="text-3xl font-bold">{currentReportData.summary.dispatchCount || 0}</p>
                <p className="text-red-100 text-xs mt-1">Items dispatched</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowDownTrayIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Add</p>
                <p className="text-3xl font-bold">{currentReportData.summary.addCount || 0}</p>
                <p className="text-green-100 text-xs mt-1">Items added</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Update</p>
                <p className="text-3xl font-bold">{currentReportData.summary.updateCount || 0}</p>
                <p className="text-purple-100 text-xs mt-1">Items updated</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CogIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quantity Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Quantity Analysis
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Total Dispatched</p>
                  <p className="text-sm text-red-600">Items sent out</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-900 text-xl">{currentReportData.summary.totalDispatchQuantity || 0}</p>
                  <p className="text-xs text-red-600">units</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Total Added</p>
                  <p className="text-sm text-green-600">Items received</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-900 text-xl">{currentReportData.summary.totalAddQuantity || 0}</p>
                  <p className="text-xs text-green-600">units</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-medium text-purple-800">Total Updated</p>
                  <p className="text-sm text-purple-600">Items modified</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-900 text-xl">{currentReportData.summary.totalUpdateQuantity || 0}</p>
                  <p className="text-xs text-purple-600">units</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
              User Activity Summary
            </h4>
            {currentReportData.userStats && currentReportData.userStats.length > 0 ? (
              <div className="space-y-3">
                {currentReportData.userStats.slice(0, 5).map((userStat, index) => (
                  <div key={userStat.user?._id || `user-stat-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{userStat.user?.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{userStat.total} activities</p>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-1">
                        {userStat.dispatch > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {userStat.dispatch}D
                          </span>
                        )}
                        {userStat.add > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {userStat.add}A
                          </span>
                        )}
                        {userStat.update > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {userStat.update}U
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No user activity data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity Summary
          </h4>
          {currentReportData.allTransactions && currentReportData.allTransactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentReportData.allTransactions.slice(0, 6).map((transaction, index) => (
                <div key={transaction._id || `transaction-${index}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'dispatch' ? 'bg-red-100 text-red-800' :
                      transaction.type === 'add' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {transaction.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{transaction.productId?.name || 'Unknown Product'}</p>
                  <p className="text-sm text-gray-600">Quantity: {transaction.quantity}</p>
                  <p className="text-sm text-gray-600">By: {transaction.userId?.name || 'Unknown User'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent transactions found</p>
            </div>
          )}
        </div>
      </div>
    );
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
          <button 
            onClick={generateReport}
            disabled={generatingReport}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
          >
            {generatingReport ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="font-medium">Generating...</span>
              </>
            ) : (
              <>
                <DocumentChartBarIcon className="w-5 h-5" />
                <span className="font-medium">Generate Report</span>
              </>
            )}
          </button>
        </div>

        {/* Report Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Report Filters</h3>
              <p className="text-gray-600">Customize your report data by selecting specific criteria below</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Active Filters: {Object.values(filters).filter(f => f !== '').length}</span>
            </div>
          </div>

          {/* Filter Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">How Filters Work</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  <strong>Inventory Reports:</strong> Show stock levels based on your selected criteria. 
                  <strong>Transaction Reports:</strong> Show system activities (dispatch, add, update) within your specified filters.
                  Leave filters empty to include all data.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1 text-green-600" />
                Start Date
                {filters.startDate && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                )}
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterUpdate('startDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Select start date"
              />
              <p className="text-xs text-gray-500 mt-1">Include data from this date onwards</p>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1 text-green-600" />
                End Date
                {filters.endDate && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                )}
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterUpdate('endDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Select end date"
              />
              <p className="text-xs text-gray-500 mt-1">Include data up to this date</p>
            </div>
            
            {selectedReport === 'inventory' && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ChartBarIcon className="w-4 h-4 mr-1 text-green-600" />
                    Category
                    {filters.category && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                    )}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterUpdate('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Filter by product category</p>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CogIcon className="w-4 h-4 mr-1 text-green-600" />
                    Storage Area
                    {filters.storageArea && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                    )}
                  </label>
                  <select
                    value={filters.storageArea}
                    onChange={(e) => handleFilterUpdate('storageArea', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Storage Areas</option>
                    {filterOptions.storageAreas.map((area, index) => (
                      <option key={index} value={area}>{area}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Filter by storage location</p>
                </div>
              </>
            )}
            
            {selectedReport === 'transactions' && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DocumentChartBarIcon className="w-4 h-4 mr-1 text-green-600" />
                    Transaction Type
                    {filters.type && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                    )}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterUpdate('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Types</option>
                    {filterOptions.transactionTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Filter by transaction type</p>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ShieldCheckIcon className="w-4 h-4 mr-1 text-green-600" />
                    User
                    {filters.userId && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                    )}
                  </label>
                  <select
                    value={filters.userId}
                    onChange={(e) => handleFilterUpdate('userId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Users</option>
                    {filterOptions.users.map((user, index) => (
                      <option key={index} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Filter by user</p>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DocumentChartBarIcon className="w-4 h-4 mr-1 text-green-600" />
                    Product
                    {filters.productId && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Set</span>
                    )}
                  </label>
                  <select
                    value={filters.productId}
                    onChange={(e) => handleFilterUpdate('productId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Products</option>
                    {filterOptions.products.map((product, index) => (
                      <option key={index} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Filter by product</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Filter Presets */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setFilters({
                    startDate: lastWeek.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    category: '',
                    storageArea: '',
                    type: '',
                    userId: '',
                    productId: ''
                  });
                }}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                  setFilters({
                    startDate: lastMonth.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    category: '',
                    storageArea: '',
                    type: '',
                    userId: '',
                    productId: ''
                  });
                }}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setFilters({ startDate: '', endDate: '', category: '', storageArea: '', type: '', userId: '', productId: '' })}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
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

        {/* Report Preview Section */}
        {currentReportData && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-800">
                {selectedReport === 'inventory' ? 'Inventory Report' : 'Transaction Report'} - {new Date(currentReportData.generatedAt).toLocaleDateString()}
              </h3>
              <div className="flex space-x-3">
                <button 
                  onClick={generatePDFPreview}
                  disabled={exportingPDF}
                  className="px-4 py-2 text-green-600 hover:text-green-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {exportingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <DocumentChartBarIcon className="w-4 h-4" />
                      <span>Preview PDF</span>
                    </>
                  )}
                </button>
                <button className="px-4 py-2 text-green-600 hover:text-green-800 font-medium">Export Excel</button>
              </div>
            </div>
            <div ref={reportRef}>
              {selectedReport === 'inventory' ? renderInventoryReport() : renderTransactionReport()}
            </div>
          </div>
        )}

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
              {/* Status Filter (hidden, no backend status) */}
              <div className="sm:w-48 hidden">
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
              {periodFilterOptions.map(option => (
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
                    key={report._id}
                    className="group flex items-center justify-between p-6 border border-gray-200 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-white transition-all duration-300 hover:shadow-lg hover:border-green-200"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DocumentChartBarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                                        <h4 className="font-semibold text-gray-800 text-lg mb-1">
                  {report.type === 'inventory' ? 'Inventory Report' : report.type === 'transaction' ? 'Transaction Report' : 'Report'}
                  {' - '}{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : 
                    (report._id ? new Date(parseInt(report._id.toString().substring(0, 8), 16) * 1000).toLocaleString() : 'Date not available')}
                </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{report.summary}</span>
                          {report.generatedBy && report.generatedBy.name && (
                            <>
                              <span>•</span>
                              <span>By {report.generatedBy.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-4 py-2 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                        {report.type === 'inventory' ? 'Inventory' : report.type === 'transaction' ? 'Transaction' : 'Other'}
                      </span>
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
      </div>

      {/* PDF Preview Modal */}
      {showPDFPreview && pdfData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">
                PDF Preview - {pdfData.fileName}
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={closePDFPreview}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Preview */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  src={pdfData.url}
                  className="w-full h-full"
                  title="PDF Preview"
                  style={{ minHeight: '600px' }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Preview generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
                <button
                  onClick={closePDFPreview}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 