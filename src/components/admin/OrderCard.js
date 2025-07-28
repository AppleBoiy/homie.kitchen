import React, { useState } from 'react';
import { RotateCcw, Clock, CheckCircle, AlertCircle, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderCard({ order, onUpdateStatus, onRefundClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-600';
      case 'preparing': return 'text-blue-600';
      case 'ready': return 'text-emerald-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'preparing': return Clock;
      case 'ready': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  // Calculate item summary for collapsed state
  const getItemSummary = () => {
    if (!order.items || !Array.isArray(order.items)) return 'No items';
    
    const itemCounts = {};
    order.items.forEach(item => {
      if (item.set_menu_id && item.set_menu_items) {
        const key = item.set_menu_name;
        itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
      } else {
        const key = item.item_name;
        itemCounts[key] = (itemCounts[key] || 0) + item.quantity;
      }
    });

    const summary = Object.entries(itemCounts)
      .map(([name, count]) => `${count}x ${name}`)
      .join(', ');

    return summary.length > 50 ? summary.substring(0, 50) + '...' : summary;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
      {/* Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
              {!isExpanded && (
                <p className="text-sm text-gray-500 mt-0.5">{getItemSummary()}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">${order.total_amount.toFixed(2)}</div>
            <div className="flex items-center justify-end space-x-1 mt-1">
              <StatusIcon className={`w-3 h-3 ${getStatusColor(order.status)}`} />
              <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              View details
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-4">
          {/* Refund Status */}
          {order.refund_status === 'refunded' && (
            <div className="bg-red-25 border border-red-100 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <RotateCcw className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-red-700">Refunded</span>
              </div>
              <div className="text-xs text-red-600 space-y-1">
                <p>Amount: ${order.refund_amount.toFixed(2)}</p>
                <p>Reason: {order.refund_reason}</p>
              </div>
            </div>
          )}

          {order.refund_status === 'requested' && (
            <div className="bg-amber-25 border border-amber-100 rounded-md p-3">
              <div className="flex items-center space-x-2 mb-2">
                <RotateCcw className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">Refund Requested</span>
              </div>
              <div className="text-xs text-amber-600">
                <p>Reason: {order.refund_reason}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">Items</h4>
            <div className="space-y-2">
              {order.items && Array.isArray(order.items) ? order.items.map(item => {
                if (item.set_menu_id && item.set_menu_items) {
                  return (
                    <div key={item.id} className="bg-white rounded-md p-3 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.quantity}x {item.set_menu_name}</span>
                        <span className="text-sm font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                      <div className="ml-2 space-y-1">
                        {item.set_menu_items.map(setItem => (
                          <div key={setItem.id} className="flex justify-between text-xs text-gray-500">
                            <span>• {setItem.item_name}</span>
                            <span>{setItem.quantity}x</span>
                          </div>
                        ))}
                      </div>
                      {item.note && (
                        <div className="ml-2 mt-2 text-xs text-amber-600 bg-amber-25 px-2 py-1 rounded">
                          Note: {item.note}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={item.id} className="bg-white rounded-md p-3 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{item.quantity}x {item.item_name}</span>
                        <span className="text-sm font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                      {item.note && (
                        <div className="mt-2 text-xs text-amber-600 bg-amber-25 px-2 py-1 rounded">
                          Note: {item.note}
                        </div>
                      )}
                    </div>
                  );
                }
              }) : (
                <div className="text-center py-3 text-xs text-gray-400 bg-white rounded-md border border-gray-100">
                  No items found
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(order.id, 'preparing')}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                >
                  Start Preparing
                </button>
                <button
                  onClick={() => onUpdateStatus(order.id, 'cancelled')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'ready')}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                Mark Ready
              </button>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            )}
            
            {order.status === 'completed' && order.refund_status === 'none' && (
              <button
                onClick={() => onRefundClick(order)}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Process Refund
              </button>
            )}

            {order.status === 'completed' && order.refund_status === 'requested' && (
              <button
                onClick={() => onRefundClick(order)}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                Process Refund
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 