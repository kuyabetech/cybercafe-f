import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function StaffManagement({ user }) {
  const [staff, setStaff] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newStaff, setNewStaff] = useState({
    email: '',
    name: '',
    password: '',
    role: 'staff',
    permissions: {
      view_projects: true,
      add_payments: true,
      view_customers: true,
      view_reports: false,
      manage_staff: false,
      system_settings: false
    }
  });

  const [editStaff, setEditStaff] = useState({
    email: '',
    name: '',
    role: 'staff',
    permissions: {
      view_projects: true,
      add_payments: true,
      view_customers: true,
      view_reports: false,
      manage_staff: false,
      system_settings: false
    }
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStaff();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/staff');
      setStaff(response.data);
    } catch (error) {
      // For demo purposes, show mock data
      const mockStaff = [
        {
          id: '1',
          email: 'staff1@cafe.com',
          name: 'John Doe',
          role: 'staff',
          permissions: {
            view_projects: true,
            add_payments: true,
            view_customers: true,
            view_reports: false,
            manage_staff: false,
            system_settings: false
          },
          last_login: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T09:00:00Z'
        },
        {
          id: '2',
          email: 'manager@cafe.com',
          name: 'Jane Smith',
          role: 'staff',
          permissions: {
            view_projects: true,
            add_payments: true,
            view_customers: true,
            view_reports: true,
            manage_staff: false,
            system_settings: false
          },
          last_login: '2024-01-14T15:45:00Z',
          created_at: '2024-01-02T11:00:00Z'
        }
      ];
      setStaff(mockStaff);
    }
    setLoading(false);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/auth/register', {
        ...newStaff,
        role: 'staff' // Force role to staff for security
      });

      toast.success('Staff member added successfully!');
      setNewStaff({
        email: '',
        name: '',
        password: '',
        role: 'staff',
        permissions: {
          view_projects: true,
          add_payments: true,
          view_customers: true,
          view_reports: false,
          manage_staff: false,
          system_settings: false
        }
      });
      setShowAddStaff(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error adding staff member');
    }
    setLoading(false);
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/auth/staff/${selectedStaff.id}`, editStaff);

      toast.success('Staff member updated successfully!');
      setShowEditStaff(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error) {
      toast.error('Error updating staff member');
    }
    setLoading(false);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure? This will permanently delete the staff account.')) {
      try {
        await axios.delete(`/api/auth/staff/${staffId}`);
        toast.success('Staff member deleted successfully!');
        fetchStaff();
      } catch (error) {
        toast.error('Error deleting staff member');
      }
    }
  };

  const openEditStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setEditStaff({
      email: staffMember.email,
      name: staffMember.name,
      role: staffMember.role,
      permissions: staffMember.permissions || {
        view_projects: true,
        add_payments: true,
        view_customers: true,
        view_reports: false,
        manage_staff: false,
        system_settings: false
      }
    });
    setShowEditStaff(true);
  };

  const permissionLabels = {
    view_projects: 'View Projects',
    add_payments: 'Add Payments',
    view_customers: 'View Customers',
    view_reports: 'View Reports',
    manage_staff: 'Manage Staff',
    system_settings: 'System Settings'
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage staff accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowAddStaff(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Staff Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Staff</h3>
          <p className="text-3xl font-bold text-blue-600">{staff.length}</p>
          <p className="text-sm text-gray-600 mt-1">Active members</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">With Report Access</h3>
          <p className="text-3xl font-bold text-green-600">
            {staff.filter(s => s.permissions?.view_reports).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Can view analytics</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recently Active</h3>
          <p className="text-3xl font-bold text-purple-600">
            {staff.filter(s => {
              const lastLogin = new Date(s.last_login);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return lastLogin > weekAgo;
            }).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No staff members yet</p>
            <button
              onClick={() => setShowAddStaff(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first staff member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{member.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.last_login ? new Date(member.last_login).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(member.permissions || {}).map(([key, value]) =>
                          value ? (
                            <span key={key} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              {permissionLabels[key]}
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openEditStaff(member)}
                        className="text-blue-600 hover:text-blue-900 font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Staff Member</h2>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
                <div className="space-y-2">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`new-${key}`}
                        checked={newStaff.permissions[key]}
                        onChange={(e) => setNewStaff({
                          ...newStaff,
                          permissions: {
                            ...newStaff.permissions,
                            [key]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`new-${key}`} className="ml-2 text-sm text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Staff Member</h2>

            <form onSubmit={handleEditStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editStaff.name}
                  onChange={(e) => setEditStaff({...editStaff, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editStaff.email}
                  onChange={(e) => setEditStaff({...editStaff, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
                <div className="space-y-2">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`edit-${key}`}
                        checked={editStaff.permissions[key]}
                        onChange={(e) => setEditStaff({
                          ...editStaff,
                          permissions: {
                            ...editStaff.permissions,
                            [key]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`edit-${key}`} className="ml-2 text-sm text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditStaff(false);
                    setSelectedStaff(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;