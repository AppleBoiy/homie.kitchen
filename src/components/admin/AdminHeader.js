import { ChefHat, BarChart3, Menu as MenuIcon, Users, User, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminHeader({ user, onAnalytics, onOpenMobileStats, onUserManagement }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-gray-900 rounded-lg hover:bg-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          
          <button
            onClick={onUserManagement}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Users</span>
          </button>
          
          <span className="text-gray-600 text-base">Welcome, {user?.name}</span>
          
          <button 
            onClick={() => window.location.href = '/profile'} 
            className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-7 h-7 text-orange-600" />
            <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            
            {/* Hamburger Menu Button */}
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none mobile-menu" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <MenuIcon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
          
          {/* Menu Panel */}
          <div className="lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 mobile-menu">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
                {/* User Info */}
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onAnalytics();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onUserManagement();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">User Management</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/profile';
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 