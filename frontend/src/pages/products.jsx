import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">PRODUCT</h1>
        
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
          
          <button className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm">
            +Dispatch
          </button>
          

        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-green-800 text-white px-6 py-4">
          <div className="grid grid-cols-5 gap-4 font-semibold text-sm">
            <div>IMAGE</div>
            <div>Name</div>
            <div>Quantity Available</div>
            <div>Category</div>
            <div>Storage Area</div>
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
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-100">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">IMG</span>
                    </div>
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-gray-800">{product.stock || 0}</div>
                    <div className="text-gray-600">{product.category}</div>
                    <div className="text-gray-600">{product.storageArea || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products; 