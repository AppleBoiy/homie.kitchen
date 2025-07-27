import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function OrderCard({ order, onUpdateStatus, onRefundClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusColor = (refundStatus) => {
    switch (refundStatus) {
      case 'refunded': return 'bg-red-100 text-red-800';
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRefundStatusText = (refundStatus) => {
    switch (refundStatus) {
      case 'refunded': return 'Refunded';
      case 'requested': return 'Refund Requested';
      case 'none': return '';
      default: return '';
    }
  };

  return (
    <div className="border rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2 sm:mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Order #{order.id}</h3>
          <p className="text-xs sm:text-sm text-gray-800">{order.customer_name}</p>
          <p className="text-xs sm:text-sm text-gray-800">{order.customer_email}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 text-sm sm:text-base">${order.total_amount.toFixed(2)}</p>
          <div className="flex flex-col gap-1 mt-1">
            <span className={`inline-block min-w-[80px] text-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            {order.refund_status !== 'none' && (
              <span className={`inline-block min-w-[80px] text-center px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(order.refund_status)}`}>
                {getRefundStatusText(order.refund_status)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Refund Information */}
      {order.refund_status === 'refunded' && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Refund Processed</span>
          </div>
          <div className="text-xs text-red-700 space-y-1">
            <p><span className="font-medium">Amount:</span> ${order.refund_amount.toFixed(2)}</p>
            <p><span className="font-medium">Reason:</span> {order.refund_reason}</p>
            <p><span className="font-medium">Date:</span> {new Date(order.refunded_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Refund Request Information */}
      {order.refund_status === 'requested' && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <RotateCcw className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Refund Requested</span>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><span className="font-medium">Reason:</span> {order.refund_reason}</p>
            <p><span className="font-medium">Requested:</span> {new Date(order.refunded_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="mb-2 sm:mb-3">
        {order.items && Array.isArray(order.items) ? order.items.map(item => {
          if (item.set_menu_id && item.set_menu_items) {
            // Set menu item - display set name and included items
            return (
              <div key={item.id} className="mb-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-900">
                  <span>{item.quantity}x {item.set_menu_name}</span>
                  <span>${(item.quantity * item.price).toFixed(2)}</span>
                </div>
                <div className="ml-2 mt-1 text-xs text-gray-600">
                  {item.set_menu_items.map(setItem => (
                    <div key={setItem.id} className="flex justify-between">
                      <span>• {setItem.item_name}</span>
                      <span>{setItem.quantity}x</span>
                    </div>
                  ))}
                </div>
                {item.note && (
                  <div className="ml-2 mt-1 text-xs text-orange-600 italic">Note: {item.note}</div>
                )}
              </div>
            );
          } else {
            // Regular menu item
            return (
              <div key={item.id} className="mb-1">
                <div className="flex justify-between text-xs sm:text-sm text-gray-900">
                  <span>{item.quantity}x {item.item_name}</span>
                  <span>${(item.quantity * item.price).toFixed(2)}</span>
                </div>
                {item.note && (
                  <div className="ml-2 mt-0.5 text-xs text-gray-500 italic">Note: {item.note}</div>
                )}
              </div>
            );
          }
        }) : (
          <div className="text-center py-2 text-gray-500 text-sm">
            No items found for this order.
          </div>
        )}
      </div>
      <div className="flex space-x-2 flex-wrap">
        {order.status === 'pending' && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, 'preparing')}
              className="px-3 py-1 bg-blue-600 text-gray-100 rounded text-sm hover:bg-blue-700"
            >
              Start Preparing
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="px-3 py-1 bg-red-600 text-gray-100 rounded text-sm hover:bg-red-700"
            >
              Cancel
            </button>
          </>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="px-3 py-1 bg-green-600 text-gray-100 rounded text-sm hover:bg-green-700"
          >
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="px-3 py-1 bg-gray-600 text-gray-100 rounded text-sm hover:bg-gray-700"
          >
            Complete
          </button>
        )}
        
        {/* Refund Button - Show for completed orders that haven't been refunded */}
        {order.status === 'completed' && order.refund_status === 'none' && (
          <button
            onClick={() => onRefundClick(order)}
            className="px-3 py-1 bg-red-600 text-gray-100 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Process Refund</span>
          </button>
        )}

        {/* Process Refund Button - Show for orders with refund requests */}
        {order.status === 'completed' && order.refund_status === 'requested' && (
          <button
            onClick={() => onRefundClick(order)}
            className="px-3 py-1 bg-green-600 text-gray-100 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Process Refund</span>
          </button>
        )}
      </div>
    </div>
  );
} 