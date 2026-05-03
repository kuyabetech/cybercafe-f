import React, { useState } from 'react';

function Sidebar({ currentPage, onPageChange, user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💰' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'reports', label: 'Analytics', icon: '📈' },
    { id: 'expenses', label: 'Financial', icon: '💸' },
    ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: '⚙️' }] : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition"
        >
          <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white shadow-lg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2 text-xl">💻</div>
          <div>
            <h1 className="font-bold text-lg">Kverify</h1>
            <p className="text-xs text-gray-400">Professional Edition</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-xs rounded capitalize">
            {user?.role}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsMobileMenuOpen(false); // Close mobile menu on selection
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;