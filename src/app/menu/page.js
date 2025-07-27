'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ShoppingCart, Plus, Minus, ArrowLeft, Clock, CheckCircle, Image as ImageIcon, Bell, X, Package, Truck, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, safeIncludes } from '@/lib/utils';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [activeOrders, setActiveOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(savedUser));

    const fetchData = async () => {
      try {
        const menuResponse = await fetch('/api/menu');
        const menuData = await menuResponse.json();
        setMenuItems(menuData);
        
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch active orders and set up real-time updates
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

  // Monitor for order status changes and show notifications
  useEffect(() => {
    if (lastOrderId) {
      const order = activeOrders.find(o => o.id === lastOrderId);
      if (order) {
        const statusMessages = {
          'pending': 'Your order has been received and is being processed!',
          'preparing': 'Your order is being prepared in the kitchen!',
          'ready': 'Your order is ready for pickup!',
          'completed': 'Your order has been completed. Enjoy your meal!',
          'cancelled': 'Your order has been cancelled.'
        };

        const message = statusMessages[order.status];
        if (message) {
          addNotification({
            id: Date.now(),
            type: 'order-update',
            title: `Order #${order.id} Update`,
            message: message,
            status: order.status,
            orderId: order.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }, [activeOrders, lastOrderId]);

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

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          items: orderItems
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        setCart([]);
        setOrderPlaced(true);
        setLastOrderId(orderData.order.id);
        
        // Add initial order notification
        addNotification({
          id: Date.now(),
          type: 'order-placed',
          title: 'Order Placed Successfully!',
          message: `Your order #${orderData.order.id} has been placed and is being processed.`,
          status: 'pending',
          orderId: orderData.order.id,
          timestamp: new Date().toISOString()
        });

        setTimeout(() => setOrderPlaced(false), 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  // Filter items based on category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === parseInt(selectedCategory);
    const matchesSearch = searchQuery === '' || 
      safeIncludes(item.name, searchQuery) ||
      (item.description && safeIncludes(item.description, searchQuery));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
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
                onClick={() => router.push('/')}
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
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Cart: {cart.length} items</span>
                <button
                  onClick={() => router.push('/orders')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Clock className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
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
                    onClick={() => setShowNotifications(!showNotifications)}
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
                    onClick={() => router.push('/orders')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Cart: {cart.length} items • Total: ${getCartTotal().toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Orders Notification Bar */}
      {activeOrders.length > 0 && (
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
                onClick={() => router.push('/orders')}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
              >
                View Orders →
              </button>
            </div>
            
            {/* Order Status Cards */}
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

      <div className="container mx-auto px-4 py-4 sm:py-6">
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Categories</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm sm:text-base ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Items
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm sm:text-base ${
                  selectedCategory === category.id.toString()
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-20 sm:mb-24">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No menu items match "${searchQuery}"`
                  : 'No items available in this category'
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
            filteredItems.map(item => {
              const imageUrl = getImageUrl(item.image_url);
              const hasImageError = imageErrors.has(item.id);
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center relative">
                    {imageUrl && !hasImageError ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onError={() => handleImageError(item.id)}
                        unoptimized={imageUrl.startsWith('http')}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{item.name}</h3>
                      <span className="text-orange-600 font-bold text-sm sm:text-base ml-2">${item.price}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-orange-600 text-white px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-orange-700 transition-colors w-full sm:w-auto"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total: ${getCartTotal().toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={placeOrder}
                className="bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-700 text-sm sm:text-base font-medium transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="fixed top-4 left-4 right-4 sm:right-4 sm:left-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center z-50">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="text-sm sm:text-base">Order placed successfully!</span>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
} 