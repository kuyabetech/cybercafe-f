import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ status: '', customer_type: '' });
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newProject, setNewProject] = useState({
    customer_name: '',
    customer_type: 'student',
    project_desc: '',
    total_amount: '',
    paid_amount: '0',
    notes: '',
    category: 'General',
    status_code: 'not_started',
    priority: 'medium',
    deadline: '',
    assigned_staff: ''
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'cash'
  });

  const normalizeCustomerKey = (name) => name.toLowerCase().trim();
  const sanitizePhone = (phone) => (phone || '').replace(/\D/g, '');
  const loadCustomerDetails = () => {
    try {
      const stored = localStorage.getItem('customerDetailsMap');
      return stored ? JSON.parse(stored) : {};
    } catch (err) {
      return {};
    }
  };

  const getCustomerPhone = (customerName) => {
    const normalized = normalizeCustomerKey(customerName);
    const details = loadCustomerDetails();
    return details[normalized]?.phone || '';
  };

  const handleMessageProjectOnWhatsApp = (project) => {
    const phone = sanitizePhone(getCustomerPhone(project.customer_name) || project.phone);
    if (!phone) {
      toast.error('Phone number is not available for this customer.');
      return;
    }

    const message = encodeURIComponent(
      `Hello ${project.customer_name}, this is ${user.name} from Cyber Cafe Pro. I am following up on your project status and payment details.`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = ['General', 'Web Design', 'Graphic Design', 'Printing', 'Computer Repair', 'Software Development'];
  const projectStatuses = [
    { id: 'not_started', label: 'Not Started', color: 'gray' },
    { id: 'in_progress', label: 'In Progress', color: 'blue' },
    { id: 'under_review', label: 'Under Review', color: 'yellow' },
    { id: 'completed', label: 'Completed', color: 'green' },
    { id: 'delivered', label: 'Delivered', color: 'purple' }
  ];
  const priorities = [
    { id: 'low', label: 'Low', color: 'green' },
    { id: 'medium', label: 'Medium', color: 'yellow' },
    { id: 'high', label: 'High', color: 'orange' },
    { id: 'urgent', label: 'Urgent', color: 'red' }
  ];

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.customer_type) params.customer_type = filters.customer_type;

      const response = await axios.get('/api/projects', { params });
      setProjects(response.data);
    } catch (error) {
      toast.error('Error fetching projects');
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/projects', {
        ...newProject,
        total_amount: parseFloat(newProject.total_amount),
        paid_amount: parseFloat(newProject.paid_amount) || 0
      });

      toast.success('Project created successfully!');
      setNewProject({
        customer_name: '',
        customer_type: 'student',
        project_desc: '',
        total_amount: '',
        paid_amount: '0',
        notes: '',
        category: 'General',
        status_code: 'not_started',
        priority: 'medium',
        deadline: '',
        assigned_staff: ''
      });
      setShowAddProject(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error creating project');
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/payments', {
        project_id: selectedProject.id,
        amount: parseFloat(newPayment.amount),
        payment_method: newPayment.payment_method
      });

      toast.success('Payment added successfully!');
      setNewPayment({ amount: '', payment_method: 'cash' });
      setShowAddPayment(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error adding payment');
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteProject = async (id) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete projects');
      return;
    }

    if (window.confirm('Are you sure? This cannot be undone.')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (error) {
        toast.error('Error deleting project');
      }
    }
  };

  const openProjectDetails = async (project) => {
    try {
      const response = await axios.get(`/api/projects/${project.id}`);
      setSelectedProject(response.data);
      setShowProjectDetails(true);
    } catch (error) {
      toast.error('Error loading project details');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      full: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      none: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProjectStatusColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProjectStatusLabel = (status) => {
    const project = projectStatuses.find(s => s.id === status);
    return project?.label || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const priorityObj = priorities.find(p => p.id === priority);
    return priorityObj?.label || priority;
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="full">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="none">Not Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select
                value={filters.customer_type}
                onChange={(e) => setFilters({...filters, customer_type: e.target.value})}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="student">Student</option>
                <option value="non-student">Non-student</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowAddProject(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            <button
              onClick={() => setShowAddProject(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 hidden sm:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 hidden md:table-cell">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 hidden lg:table-cell">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openProjectDetails(project)}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{project.customer_name}</p>
                      <p className="text-sm text-gray-500">{project.customer_type === 'student' ? 'Student' : 'Non-student'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{project.category}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                        {getPriorityLabel(project.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'No deadline'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formatCurrency(project.total_amount)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(project.paid_amount)} paid</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                        {project.status === 'full' ? 'Paid' : project.status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getProjectStatusColor(project.project_status)}`}>
                        {getProjectStatusLabel(project.project_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                      {getCustomerPhone(project.customer_name) && (
                        <button
                          onClick={() => handleMessageProjectOnWhatsApp(project)}
                          className="text-green-600 hover:text-green-900 font-medium mr-3"
                        >
                          WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowAddPayment(true);
                        }}
                        disabled={project.remaining_amount <= 0}
                        className="text-blue-600 hover:text-blue-900 font-medium mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Payment
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
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

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newProject.customer_name}
                    onChange={(e) => setNewProject({...newProject, customer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={newProject.customer_type}
                    onChange={(e) => setNewProject({...newProject, customer_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="non-student">Non-student</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Staff</label>
                <input
                  type="text"
                  value={newProject.assigned_staff}
                  onChange={(e) => setNewProject({...newProject, assigned_staff: e.target.value})}
                  placeholder="Staff member name (optional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={newProject.project_desc}
                  onChange={(e) => setNewProject({...newProject, project_desc: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newProject.total_amount}
                    onChange={(e) => setNewProject({...newProject, total_amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProject.paid_amount}
                    onChange={(e) => setNewProject({...newProject, paid_amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newProject.notes}
                  onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Payment</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">{selectedProject.customer_name}</span> - {selectedProject.category}
              </p>
              <p className="text-sm text-gray-700">
                Remaining Balance: <span className="font-bold text-red-600">
                  {formatCurrency(selectedProject.remaining_amount)}
                </span>
              </p>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={selectedProject.remaining_amount}
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online Transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPayment(false);
                    setSelectedProject(null);
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
                  {loading ? 'Processing...' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
              <button
                onClick={() => setShowProjectDetails(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-600">Customer:</span> <span className="font-semibold">{selectedProject.customer_name}</span></div>
                  <div><span className="text-gray-600">Type:</span> <span className="font-semibold capitalize">{selectedProject.customer_type}</span></div>
                  <div><span className="text-gray-600">Category:</span> <span className="font-semibold">{selectedProject.category}</span></div>
                  <div><span className="text-gray-600">Priority:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(selectedProject.priority)}`}>{getPriorityLabel(selectedProject.priority)}</span></div>
                  <div><span className="text-gray-600">Assigned Staff:</span> <span className="font-semibold">{selectedProject.assigned_staff || 'Not assigned'}</span></div>
                  <div><span className="text-gray-600">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${getProjectStatusColor(selectedProject.project_status)}`}>{getProjectStatusLabel(selectedProject.project_status)}</span></div>
                  <div><span className="text-gray-600">Start Date:</span> <span className="font-semibold">{new Date(selectedProject.start_date).toLocaleDateString('en-IN')}</span></div>
                  <div><span className="text-gray-600">Deadline:</span> <span className="font-semibold">{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString('en-IN') : 'No deadline'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Info</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-600">Total Amount:</span> <span className="font-semibold">{formatCurrency(selectedProject.total_amount)}</span></div>
                  <div><span className="text-gray-600">Paid Amount:</span> <span className="font-semibold text-green-600">{formatCurrency(selectedProject.paid_amount)}</span></div>
                  <div><span className="text-gray-600">Remaining:</span> <span className="font-semibold text-red-600">{formatCurrency(selectedProject.remaining_amount)}</span></div>
                  <div><span className="text-gray-600">Payment Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(selectedProject.status)}`}>{selectedProject.status}</span></div>
                </div>
              </div>
            </div>

            {selectedProject.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedProject.notes}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              {selectedProject.payments && selectedProject.payments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {selectedProject.payments.map(payment => (
                    <div key={payment.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.payment_date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 capitalize">{payment.payment_method}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No payments recorded yet</p>
              )}
            </div>

            <button
              onClick={() => setShowProjectDetails(false)}
              className="w-full mt-6 px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;