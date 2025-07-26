import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, PlusIcon, XMarkIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const CATEGORY_COLORS = {
  Seeds: 'bg-green-100 text-green-800',
  Seedlings: 'bg-orange-100 text-orange-800',
  Fertilizers: 'bg-blue-100 text-blue-800',
  Tools: 'bg-purple-100 text-purple-800',
  Grains: 'bg-yellow-100 text-yellow-800',
  Other: 'bg-gray-100 text-gray-800',
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    storageArea: '',
    imageUrl: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/products', {
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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const response = await fetch('http://localhost:5000/api/transactions', {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/products/${editingProduct._id}`;
      
      console.log('Sending edit request to:', url);
      console.log('Product ID:', editingProduct._id);
      console.log('Edit data:', editFormData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
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

      setShowEditModal(false);
      setEditingProduct(null);
      setEditFormData({
        name: '',
        category: '',
        quantity: '',
        storageArea: '',
        imageUrl: ''
      });

      // Show success toast
      setSuccessMessage(`Successfully updated ${editFormData.name}`);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);

    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/products/${editingProduct._id}`;
      
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-green-800">PRODUCT</h1>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-800" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            />
          </div>
          {/* Sort By Button */}
          <button className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg border border-green-800 text-green-800 font-medium shadow-sm">
            <span>SORT BY</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {/* Action Buttons */}
          <button className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm">
            +Add Product
          </button>
          <button 
            onClick={() => setShowDispatchModal(true)}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            +Dispatch
          </button>
        </div>
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
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
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
                    <option value="Seeds">Seeds</option>
                    <option value="Seedlings">Seedlings</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Tools">Tools</option>
                    <option value="Grains">Grains</option>
                    <option value="Other">Other</option>
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

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({...editFormData, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
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
    </div>
  );
};

export default Products; 