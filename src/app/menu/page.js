'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ShoppingCart, Plus, Minus, ArrowLeft, Clock, CheckCircle, Image as ImageIcon, Bell, X, Package, Truck, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, safeIncludes } from '@/lib/utils';
import MenuHeader from '@/components/customer/MenuHeader';
import ActiveOrdersBar from '@/components/customer/ActiveOrdersBar';
import CategoryTabs from '@/components/customer/CategoryTabs';
import MenuItemCard from '@/components/customer/MenuItemCard';
import SetMenuCard from '@/components/customer/SetMenuCard';
import CartBar from '@/components/common/CartBar';
import OrderSuccessMessage from '@/components/common/OrderSuccessMessage';
import SearchBar from '@/components/common/SearchBar';

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
  const [setMenus, setSetMenus] = useState([]);
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
        const safeData = Array.isArray(data) ? data : [];
        const active = safeData.filter(order =>
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
            type: 'order-status',
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
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type
      );
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { ...cartItem, quantity: item.quantity, note: item.note }
            : cartItem
        );
      }
      return [...prevCart, { ...item }];
    });
  };

  const removeFromCart = (itemId, itemType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === itemId && cartItem.type === itemType
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId && cartItem.type === itemType
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => 
        !(cartItem.id === itemId && cartItem.type === itemType)
      );
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (!user || !user.id) {
      console.error('User is not defined or missing id:', user);
      return;
    }
    if (cart.some(item => !item || typeof item.id === 'undefined')) {
      console.error('Cart contains invalid item:', cart);
      return;
    }

    try {
      // Flatten set menu items and regular items, include set_menu_id
      const orderItemsMap = new Map();
      cart.forEach(item => {
        if (item.type === 'set') {
          item.items.forEach(sub => {
            const key = `${sub.id}|${item.setMenuId}`;
            const prev = orderItemsMap.get(key) || 0;
            orderItemsMap.set(key, prev + item.quantity);
          });
        } else {
          const key = `${item.id}|`;
          const prev = orderItemsMap.get(key) || 0;
          orderItemsMap.set(key, prev + item.quantity);
        }
      });
      const orderItems = Array.from(orderItemsMap.entries()).map(([key, quantity]) => {
        const [menu_item_id, set_menu_id] = key.split('|');
        return {
          menu_item_id: Number(menu_item_id),
          quantity,
          set_menu_id: set_menu_id ? Number(set_menu_id) : undefined
        };
      });

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
        console.log('Order API response:', orderData);
        setCart([]);
        setOrderPlaced(true);
        // Defensive: support both { order: { id } } and { id }
        const orderId = orderData?.order?.id ?? orderData?.id;
        if (!orderId) {
          console.warn('Order API response missing order id:', orderData);
        }
        setLastOrderId(orderId);
        // Add initial order notification
        addNotification({
          id: Date.now(),
          type: 'order-placed',
          title: 'Order Placed Successfully!',
          message: `Your order #${orderId || '?'} has been placed and is being processed.`,
          status: 'pending',
          orderId: orderId,
          timestamp: new Date().toISOString()
        });
        setTimeout(() => setOrderPlaced(false), 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error, { user, cart });
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

  useEffect(() => {
    const fetchSetMenus = async () => {
      try {
        const response = await fetch('/api/set-menus');
        const data = await response.json();
        setSetMenus(data);
      } catch (error) {
        console.error('Error fetching set menus:', error);
      }
    };
    fetchSetMenus();
  }, []);

  // Add to cart handler for set menus
  const addSetMenuToCart = (setMenuData) => {
    setCart(prevCart => {
      // Remove existing set menu item if it exists
      const filteredCart = prevCart.filter(item => !(item.id === setMenuData.id && item.type === 'set'));
      
      // Add the new/updated set menu item
      return [...filteredCart, setMenuData];
    });
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
      <MenuHeader
        user={user}
        onBack={() => router.push('/')}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        notifications={notifications}
        showNotifications={showNotifications}
        onRemoveNotification={removeNotification}
        onShowMobileMenu={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
        cart={cart}
        onShowOrders={() => router.push('/orders')}
      />
      <ActiveOrdersBar
        activeOrders={activeOrders}
        onShowOrders={() => router.push('/orders')}
        getStatusColor={getStatusColor}
      />
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search menu items..."
        />
        <CategoryTabs
          categories={[...categories, { id: 'set', name: 'Set Menus' }]}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {searchQuery && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Showing {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          </div>
        )}
        {/* No more floating Set Menus section. Integrate set menus into the grid below. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-20 sm:mb-24">
          {selectedCategory === 'set' ? (
            setMenus.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No set menus found</h3>
              </div>
            ) : (
              setMenus.map(setMenu => (
                <SetMenuCard
                  key={setMenu.id}
                  setMenu={setMenu}
                  onAddToCart={addSetMenuToCart}
                  cart={cart}
                />
              ))
            )
          ) : (
            // All Items or category: show both menu items and set menus
            (filteredItems.length === 0 && setMenus.length === 0) ? (
              <div className="col-span-full text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No items found</h3>
              </div>
            ) : (
              <>
                {filteredItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    hasImageError={imageErrors.has(item.id)}
                    onAddToCart={addToCart}
                    onImageError={handleImageError}
                    cart={cart}
                  />
                ))}
                {setMenus.map(setMenu => (
                  <SetMenuCard
                    key={setMenu.id}
                    setMenu={setMenu}
                    onAddToCart={addSetMenuToCart}
                    cart={cart}
                  />
                ))}
              </>
            )
          )}
        </div>
      </div>
      <OrderSuccessMessage show={orderPlaced} />
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