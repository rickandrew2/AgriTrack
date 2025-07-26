import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, PlusIcon, XMarkIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '../config/api';

const CATEGORY_COLORS = {
  Rice: 'bg-green-100 text-green-800',
  Corn: 'bg-orange-100 text-orange-800',
  HVC: 'bg-purple-100 text-purple-800',
};

const DEFAULT_IMAGE = 'https://via.placeholder.com/40x40?text=No+Image';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dispatchQuantity, setDispatchQuantity] = useState('');
  const [dispatchRemarks, setDispatchRemarks] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    storageArea: '',
    imageUrl: ''
  });
  const [addFormData, setAddFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    storageArea: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl('/products'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.storageArea?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // Handle numeric sorting for quantity
      if (sortBy === 'quantity') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        // Handle string sorting
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    // Reset to first page if filters/search change and current page is out of range
    if (currentPage > totalPages) setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy, sortOrder, totalPages]);

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'storageArea', label: 'Storage Area' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Rice', label: 'Rice' },
    { value: 'Corn', label: 'Corn' },
    { value: 'HVC', label: 'HVC' }
  ];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !dispatchQuantity || dispatchQuantity <= 0) {
      alert('Please select a product and enter a valid quantity');
      return;
    }

    if (parseInt(dispatchQuantity) > selectedProduct.quantity) {
      alert('Dispatch quantity cannot exceed available stock');
      return;
    }

    setDispatchLoading(true);
    try {
      const token = localStorage.getItem('token');
              const response = await fetch(buildApiUrl('/transactions'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          type: 'dispatch',
          quantity: parseInt(dispatchQuantity),
          remarks: dispatchRemarks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create dispatch transaction');
      }

      // Refresh products to get updated quantities
      const productsResponse = await fetch(buildApiUrl('/products'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      // Reset form and close modal
      setSelectedProduct(null);
      setDispatchQuantity('');
      setDispatchRemarks('');
      setShowDispatchModal(false);
      
      // Show success toast
      setSuccessMessage(`Successfully dispatched ${dispatchQuantity} units of ${selectedProduct.name}`);
      setShowSuccessToast(true);
      
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      
    } catch (err) {
      setError(err.message);
      alert('Error creating dispatch transaction: ' + err.message);
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      storageArea: product.storageArea,
      imageUrl: product.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setEditingProduct(product);
    setShowDeleteModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add form data
      formData.append('name', addFormData.name);
      formData.append('category', addFormData.category);
      formData.append('quantity', addFormData.quantity);
      formData.append('storageArea', addFormData.storageArea);
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await fetch(buildApiUrl('/products'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      // Refresh products
      const productsResponse = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      // Reset form and close modal
      setShowAddModal(false);
      setAddFormData({
        name: '',
        category: '',
        quantity: '',
        storageArea: ''
      });
      setSelectedImage(null);
      setImagePreview('');

      // Show success toast with appropriate message
      const action = result.action === 'updated' ? 'updated' : 'added';
      setSuccessMessage(`Successfully ${action} ${addFormData.name}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

    } catch (err) {
      // Show error message in a custom modal
      const message = err.message.includes('already exists') 
        ? err.message 
        : 'Error creating product: ' + err.message;
      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`/products/${editingProduct._id}`);
      
      console.log('Sending edit request to:', url);
      console.log('Product ID:', editingProduct._id);
      console.log('Edit data:', editFormData);
      
      const formData = new FormData();
      
      // Add form data
      formData.append('name', editFormData.name);
      formData.append('category', editFormData.category);
      formData.append('quantity', editFormData.quantity);
      formData.append('storageArea', editFormData.storageArea);
      
      // Only add imageUrl if it exists and no new image is selected
      if (editFormData.imageUrl && !selectedImage) {
        formData.append('imageUrl', editFormData.imageUrl);
      }
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      // Refresh products
      const productsResponse = await fetch(buildApiUrl('/products'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setShowEditModal(false);
      setEditingProduct(null);
      setEditFormData({
        name: '',
        category: '',
        quantity: '',
        storageArea: '',
        imageUrl: ''
      });
      setSelectedImage(null);
      setImagePreview('');

      // Show success toast
      setSuccessMessage(`Successfully updated ${editFormData.name}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

    } catch (err) {
      // Show error message in a custom modal
      setErrorMessage('Error updating product: ' + err.message);
      setShowErrorModal(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = buildApiUrl(`/products/${editingProduct._id}`);
      
      console.log('Sending delete request to:', url);
      console.log('Product ID:', editingProduct._id);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Refresh products
      const productsResponse = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }

      setShowDeleteModal(false);
      setEditingProduct(null);

      // Show success toast
      setSuccessMessage(`Successfully deleted ${editingProduct.name}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

    } catch (err) {
      alert('Error deleting product: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setCurrentPage(1);
  };

  const handleImportFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    setImportResult(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await fetch(buildApiUrl('/products/import'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Import failed');
      setImportResult(result);
      // Refresh products
      const productsResponse = await fetch(buildApiUrl('/products'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (productsResponse.ok) {
        const updatedProducts = await productsResponse.json();
        setProducts(updatedProducts);
      }
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    setShowExportDropdown(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/products/export?format=${format}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md">
            <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Success!</p>
              <p className="text-sm text-green-100">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-green-100 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col space-y-6 mb-8">
        {/* Title Row */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-green-800">PRODUCT</h1>
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          {/* Search Bar */}
          <div className="relative flex-shrink-0">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-800" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 pl-10 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white rounded-lg border border-green-800 text-green-800 font-medium shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[140px] flex-shrink-0"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Sort By Dropdown */}
          <div className="relative sort-dropdown flex-shrink-0">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg border border-green-800 text-green-800 font-medium shadow-sm hover:bg-gray-50 min-w-[150px]"
            >
              <span>SORT BY: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{option.label}</span>
                    <span className="text-green-600">{getSortIcon(option.value)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm flex-shrink-0"
          >
            +Add Product
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm flex-shrink-0"
          >
            Import
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              disabled={exportLoading}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm flex-shrink-0 disabled:opacity-50"
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
            {showExportDropdown && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Export as Excel
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowDispatchModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm flex-shrink-0"
          >
            +Dispatch
          </button>
        </div>
      </div>

      {/* Results Counter and Clear Filters Row */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div>
          Showing {paginatedProducts.length > 0 ? ((currentPage - 1) * productsPerPage + 1) : 0}
          {paginatedProducts.length > 1 ? `–${(currentPage - 1) * productsPerPage + paginatedProducts.length}` : ''}
          of {products.length} products
          {(searchQuery || categoryFilter !== 'all') && (
            <span className="ml-2">
              (filtered by {searchQuery ? `"${searchQuery}"` : ''}{searchQuery && categoryFilter !== 'all' ? ' and ' : ''}{categoryFilter !== 'all' ? categoryFilter : ''})
            </span>
          )}
        </div>
        {(searchQuery || categoryFilter !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 text-green-800 font-semibold bg-green-100 hover:bg-green-200 hover:text-green-900 transition-colors duration-150 rounded-full px-4 py-1 shadow-sm border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear filters
          </button>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-green-800 text-white px-6 py-4">
          <div className="grid grid-cols-6 gap-4 font-semibold text-base">
            <div>IMAGE</div>
            <div>Name</div>
            <div>Quantity Available</div>
            <div>Category</div>
            <div>Storage Area</div>
            <div>Actions</div>
          </div>
        </div>
        {/* Table Body */}
        <div className="bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-100">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div>
                    <img
                      src={product.imageUrl || DEFAULT_IMAGE}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div className="font-medium text-gray-800">{product.name}</div>
                  <div className="text-gray-800">{product.quantity || product.stock || 0}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${CATEGORY_COLORS[product.category] || CATEGORY_COLORS.Other}`}>
                      {product.category}
                    </span>
                  </div>
                  <div className="text-gray-600">{product.storageArea || 'N/A'}</div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg font-medium border border-green-800 text-green-800 bg-white hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg font-medium border ${currentPage === page ? 'bg-green-800 text-white' : 'border-green-800 text-green-800 bg-white hover:bg-green-50'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg font-medium border border-green-800 text-green-800 bg-white hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">Dispatch Product</h2>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleDispatch}>
              <div className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product
                  </label>
                  <select
                    value={selectedProduct?._id || ''}
                    onChange={(e) => {
                      const product = products.find(p => p._id === e.target.value);
                      setSelectedProduct(product);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} (Available: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispatch Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={dispatchQuantity}
                    onChange={(e) => setDispatchQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter quantity to dispatch"
                    required
                  />
                  {selectedProduct && (
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {selectedProduct.quantity} units
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={dispatchRemarks}
                    onChange={(e) => setDispatchRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Customer order, Field application, etc."
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatchLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {dispatchLoading ? 'Processing...' : 'Dispatch'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">Edit Product</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="Rice">Rice</option>
                    <option value="Corn">Corn</option>
                    <option value="HVC">HVC</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Storage Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Area
                  </label>
                  <input
                    type="text"
                    value={editFormData.storageArea}
                    onChange={(e) => setEditFormData({...editFormData, storageArea: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image (Optional)
                  </label>
                  {editFormData.imageUrl && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                      <img
                        src={editFormData.imageUrl}
                        alt="Current"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">New Image Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{editingProduct?.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({...addFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="Rice">Rice</option>
                    <option value="Corn">Corn</option>
                    <option value="HVC">HVC</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.quantity}
                    onChange={(e) => setAddFormData({...addFormData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Storage Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Area
                  </label>
                  <input
                    type="text"
                    value={addFormData.storageArea}
                    onChange={(e) => setAddFormData({...addFormData, storageArea: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {addLoading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowImportModal(false); setImportFile(null); setImportResult(null); }}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Import Products</h2>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleImportFileChange}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={importLoading || !importFile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {importLoading ? 'Importing...' : 'Import'}
              </button>
            </form>
            {importResult && (
              <div className="mt-4">
                {importResult.error ? (
                  <div className="text-red-600 font-medium">{importResult.error}</div>
                ) : (
                  <div className="text-green-700">
                    <div>Added: <span className="font-bold">{importResult.added}</span></div>
                    <div>Updated: <span className="font-bold">{importResult.updated}</span></div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2 text-yellow-700">
                        {importResult.errors.length} row(s) skipped due to errors.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500">
              <div>Accepted columns: <b>name, category, quantity, storageArea, imageUrl</b></div>
              <div>File types: .csv, .xlsx, .xls</div>
              <div>Existing products (same name) will have their quantity increased, category and storage area updated.</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Error</h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 