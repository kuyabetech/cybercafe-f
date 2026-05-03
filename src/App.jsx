import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Login from './Login';
import Sidebar from './Sidebar';
import ToastProvider from './ToastProvider';

// Import pages (will create these next)
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Expenses from './pages/Expenses';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setCurrentPage('dashboard');
      toast.info('Logged out successfully');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💻</div>
          <p className="text-gray-600">Loading Cyber Cafe Pro...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <ToastProvider>
        <Login onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 lg:flex lg:items-stretch">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 min-h-screen lg:ml-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'projects' && 'Projects'}
                {currentPage === 'customers' && 'Customers'}
                {currentPage === 'payments' && 'Payments'}
                {currentPage === 'calendar' && 'Calendar & Reminders'}
                {currentPage === 'reports' && 'Business Intelligence'}
                {currentPage === 'expenses' && 'Financial Management'}
                {currentPage === 'settings' && 'Settings'}
              </h1>
            </div>
            <div className="text-xs lg:text-sm text-gray-600">
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {currentPage === 'dashboard' && <Dashboard user={currentUser} />}
            {currentPage === 'projects' && <Projects user={currentUser} />}
            {currentPage === 'customers' && <Customers user={currentUser} />}
            {currentPage === 'payments' && <Payments user={currentUser} />}
            {currentPage === 'calendar' && <Calendar user={currentUser} />}
            {currentPage === 'reports' && <Reports user={currentUser} />}
            {currentPage === 'expenses' && <Expenses user={currentUser} />}
            {currentPage === 'settings' && <Settings user={currentUser} />}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

// Placeholder pages - to be created with more features
function PaymentsPage({ user }) {
  return <div className="text-gray-600">Payments page coming soon...</div>;
}

function ReportsPage({ user }) {
  return <div className="text-gray-600">Reports page coming soon...</div>;
}

function SettingsPage({ user }) {
  return <div className="text-gray-600">Settings page coming soon...</div>;
}

export default App;