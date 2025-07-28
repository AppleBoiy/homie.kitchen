'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Clock, CheckCircle, XCircle, Package, Truck, RefreshCw, Search, RotateCcw } from 'lucide-react';
import { safeIncludes } from '@/lib/utils';
import RefundModal from '@/components/admin/RefundModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    fetchOrders(userData.id);
  }, [router]);

  const fetchOrders = async (customerId) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/orders?customerId=${customerId}&role=customer`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Set up real-time updates for active orders
  useEffect(() => {
    if (!user) return;

    const activeOrders = (Array.isArray(orders) ? orders : []).filter(order => 
      ['pending', 'preparing', 'ready'].includes(order.status)
    );

    if (activeOrders.length > 0) {
      const interval = setInterval(() => {
        fetchOrders(user.id);
      }, 10000); // Poll every 10 seconds for active orders

      return () => clearInterval(interval);
    }
  }, [user, orders]);

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
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderProgress = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Received', completed: true },
      { key: 'preparing', label: 'Preparing', completed: ['preparing', 'ready', 'completed'].includes(status) },
      { key: 'ready', label: 'Ready', completed: ['ready', 'completed'].includes(status) },
      { key: 'completed', label: 'Completed', completed: status === 'completed' }
    ];
    return steps;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleRefundRequest = (order) => {
    setSelectedOrderForRefund(order);
    setShowRefundModal(true);
  };

  const handleRefundProcessed = (updatedOrder) => {
    // Update the order in the local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
  };

  // Filter orders based on search query
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search by order ID
    if (safeIncludes(order.id.toString(), query)) return true;
    
    // Search by status
    if (safeIncludes(order.status, query)) return true;
    
    // Search by item names
    if (order.items && order.items.some(item => 
      safeIncludes(item.item_name, query) ||
      (item.item_description && safeIncludes(item.item_description, query))
    )) return true;
    
    // Search by total amount
    if (safeIncludes(order.total_amount.toString(), query)) return true;
    
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/menu')}
                className="mr-2 sm:mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center">
                <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mr-2" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">My Orders</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-600 text-sm hidden sm:block">Welcome, {user?.name}</span>
              <button
                onClick={() => fetchOrders(user.id)}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {(Array.isArray(orders) ? orders : []).length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start ordering delicious food from our menu!</p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-700 text-sm sm:text-base font-medium transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order History</h2>
              <div className="text-sm text-gray-600">
                {(Array.isArray(orders) ? orders : []).filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length} active orders
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search orders by ID, status, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Showing {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? `No orders match "${searchQuery}"`
                    : 'No orders available'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredOrders.map(order => {
                const isActive = ['pending', 'preparing', 'ready'].includes(order.status);
                const progressSteps = getOrderProgress(order.status);
                
                return (
                  <div key={order.id} className={`bg-white rounded-lg shadow-sm border ${isActive ? 'ring-2 ring-blue-200' : ''}`}>
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            Order #{order.id}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {new Date(order.created_at).toLocaleDateString()} at{' '}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {formatTimeAgo(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Refund Information */}
                      {order.refund_status === 'refunded' && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <RotateCcw className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Refund Requested</span>
                          </div>
                          <div className="text-xs text-yellow-700 space-y-1">
                            <p><span className="font-medium">Reason:</span> {order.refund_reason}</p>
                            <p><span className="font-medium">Requested:</span> {new Date(order.refunded_at).toLocaleString()}</p>
                            <p><span className="font-medium">Status:</span> <span className="text-yellow-600">Pending admin review</span></p>
                          </div>
                        </div>
                      )}

                      {/* Order Progress Bar */}
                      {isActive && (
                        <div className="mb-4 sm:mb-6">
                          <div className="flex items-center justify-between mb-2">
                            {progressSteps.map((step, index) => (
                              <div key={step.key} className="flex items-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                                  step.completed 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {step.completed ? '✓' : index + 1}
                                </div>
                                {index < progressSteps.length - 1 && (
                                  <div className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            {progressSteps.map(step => (
                              <span key={step.key} className="text-center">
                                {step.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 sm:space-y-3 mb-4">
                        {(() => {
                          // Group items by set_menu_id
                          const groups = {};
                          if (order.items && Array.isArray(order.items)) {
                            order.items.forEach(item => {
                              const key = item.set_menu_id || 'single';
                              if (!groups[key]) groups[key] = [];
                              groups[key].push(item);
                            });
                          }
                          return Object.entries(groups).map(([set_menu_id, items], idx) => {
                            if (set_menu_id !== 'single') {
                              // Set menu group
                              const firstItem = items[0];
                              const setMenuPrice = firstItem.set_menu_price;
                              // Count the number of sets ordered (all items in a set have the same quantity)
                              const setsOrdered = firstItem.quantity;
                              const setMenuTotal = setMenuPrice * setsOrdered;
                              
                              return (
                                <div key={set_menu_id} className="bg-orange-50 rounded p-2 mb-2">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="font-bold text-orange-700 text-sm">Set Menu</div>
                                    <div className="text-right">
                                      <p className="font-medium text-gray-800 text-sm">{setsOrdered} × ${setMenuPrice.toFixed(2)}</p>
                                      <p className="text-gray-600 text-xs">${setMenuTotal.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  {firstItem.set_menu_items ? (
                                    // Display set menu items from the set_menu_items array
                                    firstItem.set_menu_items.map((setItem, idx) => (
                                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-0">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800 text-sm sm:text-base">{setItem.item_name}</p>
                                          <p className="text-gray-600 text-xs sm:text-sm">{setItem.item_description}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-gray-600 text-xs sm:text-sm">{setItem.quantity}x</p>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    // Fallback to original logic if set_menu_items is not available
                                    items.map(item => (
                                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-0">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-800 text-sm sm:text-base">{item.item_name}</p>
                                          <p className="text-gray-600 text-xs sm:text-sm">{item.item_description}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-gray-600 text-xs sm:text-sm">{item.quantity}x</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                  {firstItem.note && (
                                    <div className="mt-2 text-orange-600 text-xs sm:text-sm italic">
                                      Note: {firstItem.note}
                                    </div>
                                  )}
                                </div>
                              );
                            } else {
                              // Regular items
                              return items.map(item => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-0">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-sm sm:text-base">{item.item_name}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm">{item.item_description}</p>
                                    {item.note && (
                                      <p className="text-orange-600 text-xs sm:text-sm mt-1 italic">
                                        Note: {item.note}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-800 text-sm sm:text-base">{item.quantity} × ${item.price.toFixed(2)}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                                  </div>
                                </div>
                              ));
                            }
                          });
                        })()}
                      </div>

                      {/* Fallback message when no items */}
                      {(!order.items || !Array.isArray(order.items) || order.items.length === 0) && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No items found for this order.
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 pt-4 border-t border-gray-200">
                        <span className="text-base sm:text-lg font-bold text-gray-800">
                          Total: ${order.total_amount.toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {isActive && (
                            <>
                              <div className="flex items-center space-x-2 text-blue-600 text-xs sm:text-sm">
                                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                                <span>Live updates enabled</span>
                              </div>
                              {['pending', 'preparing'].includes(order.status) && (
                                <button
                                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors border border-red-200"
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to cancel this order?')) return;
                                    try {
                                      const response = await fetch(`/api/orders/${order.id}/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'cancelled' })
                                      });
                                      if (response.ok) {
                                        fetchOrders(user.id);
                                      } else {
                                        alert('Failed to cancel order.');
                                      }
                                    } catch (err) {
                                      alert('Failed to cancel order.');
                                    }
                                  }}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Refund Request Button - Show for completed orders that haven't been refunded */}
                          {order.status === 'completed' && order.refund_status === 'none' && (
                            <button
                              onClick={() => handleRefundRequest(order)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-yellow-200 transition-colors border border-yellow-200 flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Request Refund</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* Refund Request Modal */}
      <RefundModal
        order={selectedOrderForRefund}
        isOpen={showRefundModal}
        onClose={() => { setShowRefundModal(false); setSelectedOrderForRefund(null); }}
        onRefundProcessed={handleRefundProcessed}
        mode="request"
      />
    </div>
  );
} 