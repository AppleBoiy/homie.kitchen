import { ChefHat, BarChart3, Menu as MenuIcon } from 'lucide-react';

export default function StaffHeader({ user, onAnalytics, onOpenMobileStats }) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-2 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none" onClick={onOpenMobileStats}>
          <MenuIcon className="w-7 h-7 text-orange-600" />
        </button>
        <ChefHat className="w-8 h-8 text-orange-600" />
        <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Staff Dashboard</h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onAnalytics}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-gray-900 rounded-lg hover:bg-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">Analytics</span>
        </button>
        <span className="text-gray-600 text-xs sm:text-base whitespace-nowrap">Welcome, {user?.name}</span>
      </div>
    </div>
  );
} 