import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0]
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'utilities',
    date: new Date().toISOString().split('T')[0],
    gst_applicable: false,
    gst_rate: '18'
  });

  const expenseCategories = [
    'utilities',
    'rent',
    'salary',
    'maintenance',
    'supplies',
    'marketing',
    'insurance',
    'equipment',
    'software',
    'miscellaneous'
  ];

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate expense data since we don't have a backend endpoint yet
      // In a full implementation, this would fetch from /api/expenses
      const mockExpenses = [
        {
          id: '1',
          description: 'Electricity Bill',
          amount: 25000,
          category: 'utilities',
          date: '2024-01-15',
          gst_applicable: true,
          gst_rate: 18,
          gst_amount: 4500,
          total_amount: 29500,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          description: 'Monthly Rent',
          amount: 150000,
          category: 'rent',
          date: '2024-01-01',
          gst_applicable: false,
          gst_rate: 0,
          gst_amount: 0,
          total_amount: 150000,
          created_at: '2024-01-01T09:00:00Z'
        },
        {
          id: '3',
          description: 'Staff Salary - January',
          amount: 200000,
          category: 'salary',
          date: '2024-01-30',
          gst_applicable: false,
          gst_rate: 0,
          gst_amount: 0,
          total_amount: 200000,
          created_at: '2024-01-30T15:00:00Z'
        }
      ];

      // Apply filters
      let filteredExpenses = mockExpenses;
      if (filters.category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === filters.category);
      }
      if (filters.dateFrom) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date <= filters.dateTo);
      }

      setExpenses(filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      toast.error('Error fetching expenses');
    }
    setLoading(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const amount = parseFloat(newExpense.amount);
      const gstRate = parseFloat(newExpense.gst_rate);
      const gstAmount = newExpense.gst_applicable ? (amount * gstRate / 100) : 0;
      const totalAmount = amount + gstAmount;

      const expenseData = {
        ...newExpense,
        amount,
        gst_amount: gstAmount,
        total_amount: totalAmount
      };

      // In a full implementation, this would POST to /api/expenses
      toast.success('Expense added successfully!');

      setNewExpense({
        description: '',
        amount: '',
        category: 'utilities',
        date: new Date().toISOString().split('T')[0],
        gst_applicable: false,
        gst_rate: '18'
      });
      setShowAddExpense(false);
      fetchExpenses();
    } catch (error) {
      toast.error('Error adding expense');
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total_amount, 0);
  const totalGST = expenses.reduce((sum, exp) => sum + exp.gst_amount, 0);
  const expensesByCategory = {};

  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.total_amount;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track expenses, GST, and financial performance</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-gray-600 mt-1">This period</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">GST Paid</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalGST)}</p>
          <p className="text-sm text-gray-600 mt-1">Tax liability</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Expenses</h3>
          <p className="text-3xl font-bold text-gray-600">{formatCurrency(totalExpenses - totalGST)}</p>
          <p className="text-sm text-gray-600 mt-1">Excluding GST</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchExpenses}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Expense History</h3>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No expenses found</p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">GST</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{expense.description}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {expense.gst_applicable ? formatCurrency(expense.gst_amount) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-red-600">
                          {formatCurrency(expense.total_amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GST Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GST Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST Applicable Expenses</span>
                <span className="text-sm font-semibold text-gray-900">
                  {expenses.filter(e => e.gst_applicable).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total GST Paid</span>
                <span className="text-sm font-semibold text-blue-600">{formatCurrency(totalGST)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">GST Rate Range</span>
                <span className="text-sm font-semibold text-gray-900">0% - 18%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h2>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gst_applicable"
                  checked={newExpense.gst_applicable}
                  onChange={(e) => setNewExpense({...newExpense, gst_applicable: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="gst_applicable" className="ml-2 text-sm text-gray-700">
                  GST Applicable
                </label>
              </div>

              {newExpense.gst_applicable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                  <select
                    value={newExpense.gst_rate}
                    onChange={(e) => setNewExpense({...newExpense, gst_rate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">0% (Exempted)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;