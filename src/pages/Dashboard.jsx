import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ user }) {
  const [summary, setSummary] = useState({
    total_projects: 0,
    pending_balance: 0,
    fully_paid: 0,
    partially_paid: 0,
    total_collected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
    setLoading(false);
  };

  // Prepare chart data
  const paymentStatusData = [
    { name: 'Fully Paid', value: summary.fully_paid, color: '#10B981' },
    { name: 'Partially Paid', value: summary.partially_paid, color: '#F59E0B' },
    { name: 'Unpaid', value: summary.total_projects - summary.fully_paid - summary.partially_paid, color: '#EF4444' }
  ];

  const collectionData = [
    { name: 'Collected', value: summary.total_collected, color: '#10B981' },
    { name: 'Pending', value: summary.pending_balance, color: '#EF4444' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
        <p className="text-blue-100">
          You're logged in as {user.role === 'admin' ? 'Administrator' : 'Staff Member'}. 
          Use the sidebar to navigate through different sections.
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Projects"
          value={summary.total_projects}
          icon="📁"
          color="border-blue-600"
        />
        <StatCard
          title="Pending Balance"
          value={formatCurrency(summary.pending_balance)}
          icon="💰"
          color="border-red-600"
        />
        <StatCard
          title="Fully Paid"
          value={summary.fully_paid}
          icon="✅"
          color="border-green-600"
        />
        <StatCard
          title="Partially Paid"
          value={summary.partially_paid}
          icon="⏳"
          color="border-yellow-600"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(summary.total_collected)}
          icon="💵"
          color="border-purple-600"
        />
      </div>

     

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Projects']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Overview Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              <Bar dataKey="value" fill="#8884d8">
                {collectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Efficiency</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{
                    width: summary.total_collected > 0
                      ? `${(summary.total_collected / (summary.total_collected + summary.pending_balance)) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {summary.total_collected + summary.pending_balance > 0
                ? `${Math.round((summary.total_collected / (summary.total_collected + summary.pending_balance)) * 100)}%`
                : '0%'}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(summary.total_collected)} collected out of{' '}
            {formatCurrency(summary.total_collected + summary.pending_balance)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fully Paid:</span>
              <span className="font-bold text-green-600">{summary.fully_paid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Partially Paid:</span>
              <span className="font-bold text-yellow-600">{summary.partially_paid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unpaid:</span>
              <span className="font-bold text-red-600">
                {summary.total_projects - summary.fully_paid - summary.partially_paid}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Current Date</p>
            <p className="font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Your Role</p>
            <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Login</p>
            <p className="font-semibold text-gray-900">Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;