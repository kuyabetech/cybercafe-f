import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Customers({ user }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    type: 'student',
    phone: '',
    email: '',
    address: '',
    college: '',
    company: ''
  });

  const [editCustomer, setEditCustomer] = useState({
    name: '',
    type: 'student',
    phone: '',
    email: '',
    address: '',
    college: '',
    company: ''
  });

  const normalizeCustomerKey = (name) => name.toLowerCase().trim();
  const loadCustomerDetails = () => {
    try {
      const stored = localStorage.getItem('customerDetailsMap');
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      return {};
    }
  };
  const saveCustomerDetails = (details) => {
    localStorage.setItem('customerDetailsMap', JSON.stringify(details));
  };
  const sanitizePhone = (phone) => (phone || '').replace(/\D/g, '');

  const handleMessageOnWhatsApp = (customer) => {
    const phone = sanitizePhone(customer.phone);
    if (!phone) {
      toast.error('Phone number is not available for this customer.');
      return;
    }

    const message = encodeURIComponent(
      `Hello ${customer.name}, this is ${user.name} from Cyber Cafe Pro. I wanted to follow up on your project status and payment details.`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      // Extract unique customers from projects
      const uniqueCustomers = {};
      response.data.forEach(project => {
        if (!uniqueCustomers[project.customer_name]) {
          uniqueCustomers[project.customer_name] = {
            name: project.customer_name,
            type: project.customer_type,
            phone: project.phone || '',
            email: project.email || '',
            address: project.address || '',
            college: project.college || '',
            company: project.company || '',
            totalSpent: 0,
            outstandingBalance: 0,
            totalProjects: 0,
            projects: []
          };
        }
        uniqueCustomers[project.customer_name].totalSpent += project.paid_amount;
        uniqueCustomers[project.customer_name].outstandingBalance += project.remaining_amount;
        uniqueCustomers[project.customer_name].totalProjects += 1;
        uniqueCustomers[project.customer_name].projects.push(project);
      });

      const storedDetails = loadCustomerDetails();
      Object.values(uniqueCustomers).forEach(customer => {
        const key = normalizeCustomerKey(customer.name);
        if (storedDetails[key]) {
          Object.assign(customer, storedDetails[key]);
        }
      });

      const customerList = Object.values(uniqueCustomers).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(customerList);
      detectDuplicates(customerList);
    } catch (error) {
      toast.error('Error fetching customers');
      console.error(error);
    }
    setLoading(false);
  };

  const detectDuplicates = (customerList) => {
    const duplicatesFound = [];
    const seen = new Set();

    customerList.forEach(customer => {
      const normalizedName = customer.name.toLowerCase().replace(/\s+/g, '');
      if (seen.has(normalizedName)) {
        duplicatesFound.push(customer);
      } else {
        seen.add(normalizedName);
      }
    });

    setDuplicates(duplicatesFound);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // For now, we'll just show a success message since we're using project-based customers
      // In a full implementation, this would create a dedicated customer record
      toast.success('Customer profile created successfully!');
      const detailsKey = normalizeCustomerKey(newCustomer.name);
      const detailsMap = loadCustomerDetails();
      detailsMap[detailsKey] = {
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        college: newCustomer.college,
        company: newCustomer.company,
        type: newCustomer.type
      };
      saveCustomerDetails(detailsMap);

      setNewCustomer({
        name: '',
        type: 'student',
        phone: '',
        email: '',
        address: '',
        college: '',
        company: ''
      });
      setShowAddCustomer(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Error creating customer profile');
    }
    setLoading(false);
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // For now, we'll just show a success message
      toast.success('Customer profile updated successfully!');
      const detailsKey = normalizeCustomerKey(editCustomer.name);
      const detailsMap = loadCustomerDetails();
      detailsMap[detailsKey] = {
        phone: editCustomer.phone,
        email: editCustomer.email,
        address: editCustomer.address,
        college: editCustomer.college,
        company: editCustomer.company,
        type: editCustomer.type
      };
      saveCustomerDetails(detailsMap);

      setShowEditCustomer(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Error updating customer profile');
    }
    setLoading(false);
  };

  const openEditCustomer = (customer) => {
    setEditCustomer({
      name: customer.name,
      type: customer.type,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      college: customer.college || '',
      company: customer.company || ''
    });
    setShowEditCustomer(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-gray-600">
            Total Customers: <span className="font-bold text-2xl text-gray-900">{customers.length}</span>
          </p>
          {duplicates.length > 0 && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''} detected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCustomer(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Customer
          </button>
          <button
            onClick={fetchCustomers}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No customers yet</p>
            <p className="text-gray-400 mt-2">Create a project to add a customer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customers.map(customer => (
              <div
                key={customer.name}
                onClick={() => openCustomerDetails(customer)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {customer.type === 'student' ? '👨‍🎓 Student' : '💼 Non-student'}
                      {customer.phone && (
                        <span className="text-gray-500"> · {customer.phone}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {customer.type === 'student' ? '👨‍🎓' : '💼'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.totalProjects}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outstanding</p>
                    <p className={`text-2xl font-bold ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(customer.outstandingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Collection %</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {customer.totalSpent + customer.outstandingBalance > 0
                        ? `${Math.round((customer.totalSpent / (customer.totalSpent + customer.outstandingBalance)) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <p className="text-gray-600 mt-1">
                  {selectedCustomer.type === 'student' ? '👨‍🎓 Student' : '💼 Non-student'}
                </p>
                {selectedCustomer.phone && (
                  <p className="text-sm text-blue-600 mt-2">
                    Phone: <a href={`https://wa.me/${sanitizePhone(selectedCustomer.phone)}`} target="_blank" rel="noreferrer" className="underline">
                      {selectedCustomer.phone}
                    </a>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.phone && (
                  <button
                    onClick={() => handleMessageOnWhatsApp(selectedCustomer)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    WhatsApp
                  </button>
                )}
                <button
                  onClick={() => openEditCustomer(selectedCustomer)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{selectedCustomer.totalProjects}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(selectedCustomer.outstandingBalance)}</p>
              </div>
            </div>

            {/* Projects List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects ({selectedCustomer.projects.length})</h3>
              <div className="divide-y divide-gray-200">
                {selectedCustomer.projects.map(project => (
                  <div key={project.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{project.project_desc}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: <span className="font-semibold">{project.category || 'General'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(project.total_amount)}</p>
                        <p className="text-sm text-gray-600">
                          {project.paid_amount > 0 ? `${formatCurrency(project.paid_amount)} paid` : 'No payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Efficiency */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Efficiency</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Collected vs Outstanding</span>
                  <span className="font-bold">
                    {selectedCustomer.totalSpent + selectedCustomer.outstandingBalance > 0
                      ? `${Math.round((selectedCustomer.totalSpent / (selectedCustomer.totalSpent + selectedCustomer.outstandingBalance)) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-full transition-all"
                    style={{
                      width: selectedCustomer.totalSpent + selectedCustomer.outstandingBalance > 0
                        ? `${(selectedCustomer.totalSpent / (selectedCustomer.totalSpent + selectedCustomer.outstandingBalance)) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Customer Profile</h2>

            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={newCustomer.type}
                  onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="non-student">Non-student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {newCustomer.type === 'student' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                  <input
                    type="text"
                    value={newCustomer.college}
                    onChange={(e) => setNewCustomer({...newCustomer, college: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Customer Profile</h2>

            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editCustomer.name}
                  onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={editCustomer.type}
                  onChange={(e) => setEditCustomer({...editCustomer, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="non-student">Non-student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editCustomer.phone}
                  onChange={(e) => setEditCustomer({...editCustomer, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editCustomer.email}
                  onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editCustomer.address}
                  onChange={(e) => setEditCustomer({...editCustomer, address: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editCustomer.type === 'student' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                  <input
                    type="text"
                    value={editCustomer.college}
                    onChange={(e) => setEditCustomer({...editCustomer, college: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                  <input
                    type="text"
                    value={editCustomer.company}
                    onChange={(e) => setEditCustomer({...editCustomer, company: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditCustomer(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;