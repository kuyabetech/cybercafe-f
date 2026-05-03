import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

function Payments({ user }) {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    project_id: '',
    payment_method: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchProjects();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.project_id) params.project_id = filters.project_id;
      if (filters.payment_method) params.payment_method = filters.payment_method;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      // For now, we'll get payments from projects endpoint
      // In production, you'd have a dedicated payments endpoint
      const response = await axios.get('/api/projects');
      const allPayments = [];

      response.data.forEach(project => {
        if (project.payments && project.payments.length > 0) {
          project.payments.forEach(payment => {
            allPayments.push({
              ...payment,
              project_name: project.customer_name,
              project_desc: project.project_desc,
              total_amount: project.total_amount
            });
          });
        }
      });

      // Apply filters
      let filteredPayments = allPayments;
      if (filters.project_id) {
        filteredPayments = filteredPayments.filter(p => p.project_id === filters.project_id);
      }
      if (filters.payment_method) {
        filteredPayments = filteredPayments.filter(p => p.payment_method === filters.payment_method);
      }
      if (filters.date_from) {
        filteredPayments = filteredPayments.filter(p => new Date(p.payment_date) >= new Date(filters.date_from));
      }
      if (filters.date_to) {
        filteredPayments = filteredPayments.filter(p => new Date(p.payment_date) <= new Date(filters.date_to));
      }

      setPayments(filteredPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date)));
    } catch (error) {
      toast.error('Error fetching payments');
      console.error(error);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG');
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      upi: '📱',
      online: '💳'
    };
    return icons[method] || '💰';
  };

  const exportToExcel = () => {
    // For now, export as CSV. To export as Excel, install 'xlsx' library
    // npm install xlsx
    // Then uncomment the Excel export code below

    const csvData = [
      ['Date', 'Customer', 'Project', 'Amount', 'Method', 'Status'],
      ...payments.map(p => [
        formatDate(p.payment_date),
        p.project_name,
        p.project_desc,
        p.amount,
        p.payment_method,
        p.amount >= p.total_amount ? 'Full Payment' : 'Partial Payment'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payments exported to CSV!');

    // Uncomment below for Excel export (requires xlsx library):
    /*
    import * as XLSX from 'xlsx';

    const ws = XLSX.utils.aoa_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Payments exported to Excel!');
    */
  };

  const generateReceipt = (payment) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('💻 Cyber Cafe Pro', 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Receipt', 105, 35, { align: 'center' });

      // Receipt details
      doc.setFontSize(12);
      let yPos = 60;

      doc.text(`Receipt No: RCP-${payment.id}`, 20, yPos);
      yPos += 15;
      doc.text(`Date: ${formatDate(payment.payment_date)}`, 20, yPos);
      yPos += 15;
      doc.text(`Customer: ${payment.project_name}`, 20, yPos);
      yPos += 15;
      doc.text(`Project: ${payment.project_desc}`, 20, yPos);
      yPos += 15;
      doc.text(`Payment Method: ${payment.payment_method}`, 20, yPos);
      yPos += 20;

      // Amount (highlighted)
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Amount Paid: ${formatCurrency(payment.amount)}`, 20, yPos);

      // Footer
      yPos += 30;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
      yPos += 10;
      doc.text('Cyber Cafe Pro - Professional Project Management', 105, yPos, { align: 'center' });

      // Save the PDF
      doc.save(`receipt_${payment.id}.pdf`);
      toast.success('PDF receipt generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF receipt');
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Payments</h2>
          <div className="flex gap-4">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📊 Export to CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="text-3xl">₦</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payments.filter(p => {
                    const paymentDate = new Date(p.payment_date);
                    const now = new Date();
                    return paymentDate.getMonth() === now.getMonth() &&
                           paymentDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id}
                onChange={(e) => setFilters({...filters, project_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.customer_name} - {project.project_desc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.payment_method}
                onChange={(e) => setFilters({...filters, payment_method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.project_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {payment.project_desc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="flex items-center">
                          <span className="mr-2">{getPaymentMethodIcon(payment.payment_method)}</span>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => generateReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          🧾 Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;