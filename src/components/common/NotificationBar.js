'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Package, Clock, CheckCircle, Truck } from 'lucide-react';

export default function NotificationBar({ user, onOrderClick }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchActiveOrders = async () => {
      try {
        const response = await fetch(`/api/orders?customerId=${user.id}&role=customer`);
        const data = await response.json();
        const active = data.filter(order => 
          ['pending', 'preparing', 'ready'].includes(order.status)
        );
        setActiveOrders(active);
      } catch (error) {
        console.error('Error fetching active orders:', error);
      }
    };

    fetchActiveOrders();

    // Set up polling for real-time updates every 10 seconds
    const interval = setInterval(fetchActiveOrders, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
    setShowNotifications(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'preparing':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'ready':
        return <Truck className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 hover:bg-gray-100 rounded-lg relative"
        >
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-gray-100 text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </button>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(notification.status)}
                          <h4 className="font-medium text-gray-800 text-sm">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-gray-600 text-sm">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active Orders Notification Bar */}
      {activeOrders.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  You have {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={onOrderClick}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Orders →
              </button>
            </div>
            
            {/* Order Status Cards */}
            <div className="mt-3 flex space-x-3 overflow-x-auto">
              {activeOrders.map(order => (
                <div key={order.id} className="flex-shrink-0 bg-white rounded-lg border border-blue-200 p-3 min-w-48">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">Order #{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items?.length || 0} items • ${order.total_amount}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
} 