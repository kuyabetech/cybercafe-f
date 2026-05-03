import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StaffManagement from './StaffManagement';

function Settings({ user }) {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'staff',
    cafe_name: user?.cafe_name || 'My Cyber Cafe'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate user data since we don't have a dedicated users endpoint
      // In production, you'd have GET /api/users endpoint
      const mockUsers = [
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          cafe_name: user.cafe_name,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Error fetching users');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate audit logs since we don't have a dedicated audit endpoint
      // In production, you'd have GET /api/audit-log endpoint
      const mockLogs = [
        {
          id: '1',
          action: 'user_login',
          userId: user.id,
          details: { email: user.email },
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          action: 'project_created',
          userId: user.id,
          details: { project_id: '123', customer_name: 'John Doe' },
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setAuditLogs(mockLogs);
    } catch (error) {
      toast.error('Error fetching audit logs');
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/auth/register', newUser);

      toast.success('User created successfully!');
      setNewUser({
        email: '',
        name: '',
        password: '',
        role: 'staff',
        cafe_name: user?.cafe_name || 'My Cyber Cafe'
      });
      setShowAddUser(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creating user');
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete users');
      return;
    }

    if (userId === user.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        // In production, you'd have DELETE /api/users/:id endpoint
        toast.info('User deletion not implemented in demo version');
      } catch (error) {
        toast.error('Error deleting user');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      user_login: '🔐',
      user_created: '👤',
      project_created: '📋',
      project_deleted: '🗑️',
      payment_added: '💰'
    };
    return icons[action] || '📝';
  };

  const exportAuditLogs = () => {
    const csvData = [
      ['Date', 'Action', 'User', 'Details'],
      ...auditLogs.map(log => [
        formatDate(log.timestamp),
        log.action,
        log.details.email || 'Unknown',
        JSON.stringify(log.details)
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported!');
  };

  const backupData = () => {
    // Simulate data backup
    const backupData = {
      timestamp: new Date().toISOString(),
      users: users,
      audit_logs: auditLogs,
      version: '1.0.0'
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybercafe_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data backup created!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <div className="flex gap-4">
            <button
              onClick={backupData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              💾 Backup Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👥 User Management
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                👷 Staff Management
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Audit Logs
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'system'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ System Info
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">User Accounts</h3>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      ➕ Add User
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {u.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {u.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {u.last_login ? formatDate(u.last_login) : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {user?.role === 'admin' && u.id !== user.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Staff Management Tab */}
            {activeTab === 'staff' && (
              <StaffManagement user={user} />
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Audit Logs</h3>
                  <button
                    onClick={exportAuditLogs}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    📊 Export Logs
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading audit logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-600">No audit logs found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <span className="text-2xl mr-3">{getActionIcon(log.action)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.action.replace('_', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {log.details.email || 'System'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(log.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* System Info Tab */}
            {activeTab === 'system' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium mb-4">Application Info</h4>
                    <div className="space-y-2">
                      <p><strong>Version:</strong> 1.0.0</p>
                      <p><strong>Environment:</strong> Production</p>
                      <p><strong>Database:</strong> JSON File-based</p>
                      <p><strong>Last Backup:</strong> Never</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium mb-4">Current Session</h4>
                    <div className="space-y-2">
                      <p><strong>User:</strong> {user?.name}</p>
                      <p><strong>Role:</strong> {user?.role}</p>
                      <p><strong>Cafe:</strong> {user?.cafe_name}</p>
                      <p><strong>Login Time:</strong> {formatDate(new Date().toISOString())}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;