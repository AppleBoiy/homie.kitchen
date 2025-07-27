import { ChefHat, ArrowLeft, Bell, Clock, Menu as MenuIcon } from 'lucide-react';

export default function MenuHeader({ user, onBack, onShowNotifications, notifications, showNotifications, onRemoveNotification, onShowMobileMenu, showMobileMenu, cart, onShowOrders }) {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-2 sm:mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mr-2" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Homie Kitchen</h1>
            </div>
          </div>
          {/* Desktop Header Actions */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-gray-600 text-sm">Welcome, {user?.name}</span>
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={onShowNotifications}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {/* Status icon can be added here if needed */}
                              <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
                            </div>
                            <p className="text-gray-600 text-sm">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                          </div>
                          <button
                            onClick={() => onRemoveNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Cart: {cart.length} items</span>
              <button
                onClick={onShowOrders}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Clock className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Mobile Header Actions */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={onShowMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onShowNotifications}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={onShowOrders}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Cart: {cart.length} items
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 