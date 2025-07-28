import { Clock, ChefHat, CheckCircle, XCircle, Package, DollarSign, User } from 'lucide-react';

export default function OrderList({ orders, onUpdateStatus, userRole }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4 text-blue-600" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
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
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'completed';
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (orders.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders found</h3>
        <p className="text-sm text-gray-500">Orders will appear here when customers place them.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Orders</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order.id} className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Order #{order.id}
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{order.customer_name}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="text-gray-500">{order.customer_email}</span>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-xs sm:text-sm">
                    <div className="flex-1 mb-1 sm:mb-0">
                      <div className="font-medium text-gray-900">
                        {item.item_name || item.set_menu_name}
                      </div>
                      {item.note && (
                        <div className="text-gray-500 text-xs mt-1">
                          Note: {item.note}
                        </div>
                      )}
                      {item.set_menu_items && (
                        <div className="text-gray-500 text-xs mt-1">
                          Includes: {item.set_menu_items.map(smi => `${smi.quantity}x ${smi.item_name}`).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right sm:text-left">
                      <div className="font-medium text-gray-900">
                        {item.quantity}x ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-500">
                Total: <span className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</span>
              </div>
              
              {userRole === 'staff' && getNextStatus(order.status) && (
                <button
                  onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
                >
                  Mark as {getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 