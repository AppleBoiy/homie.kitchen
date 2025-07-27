import { ChefHat, BarChart3, Menu as MenuIcon, Users, User, LogOut } from 'lucide-react';

export default function StaffHeader({ user, onAnalytics, onOpenMobileStats, onUserManagement }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
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
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }} 
            className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-3">
        {/* Top Row - Brand and Menu */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <ChefHat className="w-7 h-7 text-orange-600" />
            <h1 className="text-lg font-bold text-gray-800">Staff Dashboard</h1>
          </div>
          
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none" 
            onClick={onOpenMobileStats}
          >
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        {/* Bottom Row - Actions and User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onAnalytics}
              className="flex items-center space-x-1 px-3 py-2 bg-orange-500 text-gray-900 rounded-lg hover:bg-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
            
            <button
              onClick={onUserManagement}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Users</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 hidden sm:inline">Welcome, {user?.name}</span>
            <button 
              onClick={() => window.location.href = '/profile'} 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }} 
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 