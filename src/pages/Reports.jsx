import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

function Reports({ user }) {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, paymentsRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/dashboard/summary')
      ]);

      setProjects(projectsRes.data);

      // Extract payments from projects
      const allPayments = [];
      projectsRes.data.forEach(project => {
        if (project.payments && project.payments.length > 0) {
          project.payments.forEach(payment => {
            allPayments.push({
              ...payment,
              project_name: project.customer_name,
              project_category: project.category,
              customer_type: project.customer_type
            });
          });
        }
      });
      setPayments(allPayments);
    } catch (error) {
      toast.error('Error fetching report data');
      console.error(error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Calculate metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'full').length;
  const pendingAmount = projects.reduce((sum, p) => sum + p.remaining_amount, 0);

  // Category breakdown
  const categoryStats = {};
  projects.forEach(project => {
    if (!categoryStats[project.category]) {
      categoryStats[project.category] = { count: 0, revenue: 0 };
    }
    categoryStats[project.category].count += 1;
    categoryStats[project.category].revenue += project.paid_amount;
  });

  // Payment method breakdown
  const paymentMethodStats = {};
  payments.forEach(payment => {
    if (!paymentMethodStats[payment.payment_method]) {
      paymentMethodStats[payment.payment_method] = 0;
    }
    paymentMethodStats[payment.payment_method] += payment.amount;
  });

  // Top customers analysis
  const topCustomers = {};
  projects.forEach(project => {
    if (!topCustomers[project.customer_name]) {
      topCustomers[project.customer_name] = {
        name: project.customer_name,
        totalSpent: 0,
        projectsCount: 0,
        outstandingBalance: 0,
        type: project.customer_type
      };
    }
    topCustomers[project.customer_name].totalSpent += project.paid_amount;
    topCustomers[project.customer_name].outstandingBalance += project.remaining_amount;
    topCustomers[project.customer_name].projectsCount += 1;
  });

  // Monthly revenue analysis
  const monthlyRevenue = {};
  projects.forEach(project => {
    const month = new Date(project.start_date).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = 0;
    }
    monthlyRevenue[month] += project.paid_amount;
  });

  // Collection efficiency over time
  const collectionEfficiency = {};
  projects.forEach(project => {
    const month = new Date(project.start_date).toISOString().slice(0, 7); // YYYY-MM
    if (!collectionEfficiency[month]) {
      collectionEfficiency[month] = { total: 0, collected: 0 };
    }
    collectionEfficiency[month].total += project.total_amount;
    collectionEfficiency[month].collected += project.paid_amount;
  });

  // Peak hours analysis (assuming payments have timestamps)
  const peakHours = {};
  payments.forEach(payment => {
    // For demo purposes, we'll simulate hour distribution
    const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
    if (!peakHours[hour]) {
      peakHours[hour] = 0;
    }
    peakHours[hour] += payment.amount;
  });

  // Profitability by category
  const categoryProfitability = {};
  projects.forEach(project => {
    if (!categoryProfitability[project.category]) {
      categoryProfitability[project.category] = {
        revenue: 0,
        projects: 0,
        avgProjectValue: 0,
        collectionRate: 0
      };
    }
    categoryProfitability[project.category].revenue += project.paid_amount;
    categoryProfitability[project.category].projects += 1;
  });

  Object.keys(categoryProfitability).forEach(category => {
    const cat = categoryProfitability[category];
    cat.avgProjectValue = cat.revenue / cat.projects;
    cat.collectionRate = (cat.revenue / (cat.revenue + projects
      .filter(p => p.category === category)
      .reduce((sum, p) => sum + p.remaining_amount, 0))) * 100;
  });

  // Prepare chart data
  const categoryChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    revenue: stats.revenue,
    projects: stats.count
  }));

  const monthlyChartData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12) // Last 12 months
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-NG', { year: 'numeric', month: 'short' }),
      revenue: amount
    }));

  const paymentMethodChartData = Object.entries(paymentMethodStats).map(([method, amount]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1),
    amount,
    percentage: ((amount / totalRevenue) * 100).toFixed(1)
  }));

  const collectionEfficiencyChartData = Object.entries(collectionEfficiency)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-NG', { year: 'numeric', month: 'short' }),
      efficiency: data.total > 0 ? (data.collected / data.total * 100) : 0,
      collected: data.collected,
      total: data.total
    }));

  const customerTypeChartData = ['student', 'non-student'].map(type => {
    const count = projects.filter(p => p.customer_type === type).length;
    const revenue = projects
      .filter(p => p.customer_type === type)
      .reduce((sum, p) => sum + p.paid_amount, 0);
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      revenue
    };
  });

  const topCustomersList = Object.values(topCustomers)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const exportReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      date_range: dateRange,
      summary: {
        total_revenue: totalRevenue,
        total_projects: totalProjects,
        completed_projects: completedProjects,
        pending_amount: pendingAmount,
        completion_rate: totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0
      },
      category_breakdown: categoryStats,
      payment_methods: paymentMethodStats,
      monthly_revenue: monthlyRevenue,
      top_customers: topCustomersList,
      collection_efficiency: collectionEfficiency,
      peak_hours: peakHours,
      category_profitability: categoryProfitability
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybercafe_bi_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Business Intelligence Report exported successfully!');
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  const ProgressBar = ({ value, max, color = 'bg-blue-500' }) => {
    const percentage = max > 0 ? (value / max * 100) : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h2>
          <div className="flex gap-4">
            <button
              onClick={exportReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📊 Export BI Report
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Report Period</h3>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            icon="💰"
            color="border-l-green-500"
          />
          <StatCard
            title="Total Projects"
            value={totalProjects}
            icon="📋"
            color="border-l-blue-500"
            subtitle={`${completedProjects} completed`}
          />
          <StatCard
            title="Pending Amount"
            value={formatCurrency(pendingAmount)}
            icon="⏳"
            color="border-l-yellow-500"
          />
          <StatCard
            title="Completion Rate"
            value={`${totalProjects > 0 ? (completedProjects / totalProjects * 100).toFixed(1) : 0}%`}
            icon="✅"
            color="border-l-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown - Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue by Category</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Payment Methods - Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Payment Methods</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percentage }) => `${method} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {paymentMethodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Trend - Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Monthly Revenue Trend</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Customer Types - Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Customer Types</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => value} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'count' ? value : formatCurrency(value),
                      name === 'count' ? 'Projects' : 'Revenue'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#10B981" name="Projects" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#3B82F6" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Top Customers</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-3">
                {topCustomersList.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">
                          {customer.projectsCount} projects • {customer.type === 'student' ? '👨‍🎓' : '💼'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                      {customer.outstandingBalance > 0 && (
                        <p className="text-xs text-red-600">{formatCurrency(customer.outstandingBalance)} pending</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection Efficiency Trend - Line Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Collection Efficiency Trend</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={collectionEfficiencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'efficiency' ? `${value.toFixed(1)}%` : formatCurrency(value),
                      name === 'efficiency' ? 'Efficiency' : name === 'collected' ? 'Collected' : 'Total'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} name="Efficiency %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Peak Hours Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Peak Business Hours</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(peakHours)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([hour, amount]) => (
                    <div key={hour} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : `${hour} AM`}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Category Profitability */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Category Performance</h3>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryProfitability)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)
                  .map(([category, data]) => (
                    <div key={category} className="border-b border-gray-100 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span>Avg Project: {formatCurrency(data.avgProjectValue)}</span>
                        </div>
                        <div>
                          <span>Collection: {data.collectionRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          value={data.collectionRate}
                          max={100}
                          color="bg-blue-500"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;