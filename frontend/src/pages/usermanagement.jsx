import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, UserPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Staff', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl('/users'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'Staff', password: '' });
    setValidationErrors({});
    setError('');
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase(), 
      password: '' 
    });
    setValidationErrors({});
    setError('');
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setLoading(true);
    setError('');
    try {
      // You need to implement DELETE endpoint in backend for this to work
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/users/${userToDelete._id || userToDelete.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      setUsers(users.filter((u) => (u._id || u.id) !== (userToDelete._id || userToDelete.id)));
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const validateField = (field, value) => {
    const errors = {};
    
    if (field === 'name') {
      if (!value.trim()) {
        errors.name = 'Name is required';
      } else if (value.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      }
    }
    
    if (field === 'email') {
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
      }
    }
    
    if (field === 'password' && !editingUser) {
      if (!value.trim()) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    }
    
    return errors;
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error when user makes changes
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setError('Password is required for new users');
      return;
    }
    if (!editingUser && form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Check if email already exists (for new users or when email is changed)
    if (!editingUser || (editingUser && editingUser.email !== form.email)) {
      const existingUser = users.find(user => user.email.toLowerCase() === form.email.toLowerCase());
      if (existingUser) {
        setError('A user with this email already exists');
        return;
      }
    }
    
    // Check if name already exists (for new users or when name is changed)
    if (!editingUser || (editingUser && editingUser.name !== form.name)) {
      const existingUser = users.find(user => user.name.toLowerCase() === form.name.toLowerCase());
      if (existingUser) {
        setError('A user with this name already exists');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let response, data;
      if (editingUser) {
        // Update existing user
        response = await fetch(buildApiUrl(`/users/${editingUser._id || editingUser.id}`), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role.toLowerCase(),
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
        }
        data = await response.json();
        setUsers(users.map((u) => ((u._id || u.id) === (editingUser._id || editingUser.id) ? { ...data.user, _id: data.user.id } : u)));
        setSuccess('User updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        response = await fetch(buildApiUrl('/users/register'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: form.name,
            email: form.email,
            role: form.role.toLowerCase(),
            password: form.password,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add user');
        }
        data = await response.json();
        setUsers([...users, { ...data.user, _id: data.user.id }]);
        setSuccess('User added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">User Management</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium"
          onClick={handleAdd}
        >
          <UserPlusIcon className="w-5 h-5" />
          Add User
        </button>
      </div>
      {success && <div className="text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded mb-4">{success}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-medium">Error: {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <thead className="bg-green-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role.toLowerCase() === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm p-4">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-4 sm:mb-6 flex items-center gap-2">
              {editingUser ? (
                <>
                  <PencilIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  Edit User
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  Add User
                </>
              )}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Full Name</label>
                <input
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white ${
                    validationErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  onBlur={(e) => {
                    const errors = validateField('name', e.target.value);
                    setValidationErrors(prev => ({ ...prev, ...errors }));
                  }}
                  placeholder="Enter full name"
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <input
                  type="email"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white ${
                    validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                  }`}
                  value={form.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  onBlur={(e) => {
                    const errors = validateField('email', e.target.value);
                    setValidationErrors(prev => ({ ...prev, ...errors }));
                  }}
                  placeholder="Enter email address"
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Role</label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={form.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
                  <input
                    type="password"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white ${
                      validationErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                    }`}
                    value={form.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    onBlur={(e) => {
                      const errors = validateField('password', e.target.value);
                      setValidationErrors(prev => ({ ...prev, ...errors }));
                    }}
                    placeholder="Enter password"
                    required
                  />
                  {validationErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="button"
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() => {
                    setShowModal(false);
                    setValidationErrors({});
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {editingUser ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    editingUser ? 'Update User' : 'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete User</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">Are you sure you want to delete this user?</p>
              <div className="bg-white rounded-lg p-3 border border-red-100">
                <p className="text-gray-700 font-medium">{userToDelete.name}</p>
                <p className="text-gray-500 text-sm">{userToDelete.email}</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  userToDelete.role === 'Admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userToDelete.role}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                onClick={handleDeleteCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
