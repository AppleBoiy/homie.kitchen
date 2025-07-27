import { Package, Truck } from 'lucide-react';

export default function ActiveOrdersBar({ activeOrders, onShowOrders, getStatusColor }) {
  if (!activeOrders || activeOrders.length === 0) return null;
  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="font-medium text-blue-800 text-sm sm:text-base">
              You have {activeOrders.length} active order{activeOrders.length > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onShowOrders}
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
          >
            View Orders →
          </button>
        </div>
        <div className="mt-3 flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
          {activeOrders.map(order => (
            <div key={order.id} className="flex-shrink-0 bg-white rounded-lg border border-blue-200 p-2 sm:p-3 min-w-40 sm:min-w-48">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="font-medium text-gray-800 text-sm sm:text-base">Order #{order.id}</span>
                <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {order.items?.length || 0} items • ${order.total_amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 