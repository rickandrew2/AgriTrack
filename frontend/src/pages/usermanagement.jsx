import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, UserPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api/users';

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

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL, {
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
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '' });
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
      const response = await fetch(`${API_URL}/${userToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter((u) => u._id !== userToDelete._id));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let response, data;
      if (editingUser) {
        // You need to implement PUT endpoint in backend for this to work
        response = await fetch(`${API_URL}/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('Failed to update user');
        data = await response.json();
        setUsers(users.map((u) => (u._id === editingUser._id ? data.user : u)));
        setSuccess('User updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        response = await fetch(`${API_URL}/register`, {
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
        if (!response.ok) throw new Error('Failed to add user');
        data = await response.json();
        setUsers([...users, data.user]);
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
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <th className="py-4 px-6 text-left font-semibold text-lg">Name</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Email</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Role</th>
              <th className="py-4 px-6 text-left font-semibold text-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                <td className="py-4 px-6 font-medium text-gray-800">{user.name}</td>
                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm"
                      onClick={() => handleEdit(user)}
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium text-sm"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              {editingUser ? (
                <>
                  <PencilIcon className="w-6 h-6" />
                  Edit User
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-6 h-6" />
                  Add User
                </>
              )}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
