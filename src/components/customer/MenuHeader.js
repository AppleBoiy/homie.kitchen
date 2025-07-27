import { ChefHat, ArrowLeft, Clock, Menu as MenuIcon, ShoppingCart, X, CheckCircle, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function MenuHeader({ user, onBack, onShowMobileMenu, showMobileMenu, cart, onShowOrders }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user || !user.id) throw new Error('User not found');
      // Create order items - one per cart item
      const orderItems = [];
      cart.forEach(item => {
        if (item.type === 'set') {
          // For set menus, create one order item representing the set itself
          // The quantity represents how many sets were ordered
          orderItems.push({
            menu_item_id: null, // No specific menu item for set menus
            quantity: item.quantity, // Number of sets ordered
            set_menu_id: Number(item.setMenuId),
            note: item.note || null
          });
        } else {
          orderItems.push({
            menu_item_id: Number(item.id),
            quantity: item.quantity,
            set_menu_id: null,
            note: item.note || null
          });
        }
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
        setOrderPlaced(true);
        localStorage.removeItem('cart');
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCheckout(false);
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-bold text-2xl text-gray-900">
            <ChefHat className="w-8 h-8 text-orange-600 mr-2" />
            Homie Kitchen
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Cart summary and checkout button */}
          <div className="flex items-center space-x-3 bg-white border rounded-lg px-4 py-2 shadow-sm">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-gray-900">{cart.reduce((total, item) => total + item.quantity, 0)} items</span>
            <span className="text-sm text-gray-600">Total: ${getCartTotal().toFixed(2)}</span>
            <button
              onClick={() => setShowCheckout(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Checkout
            </button>
          </div>
          
          <span className="text-gray-700">Welcome, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
          
          <button 
            onClick={() => window.location.href = '/profile'} 
            className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </button>
          
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }} 
            className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 rounded hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-orange-600" />
          </button>
          <span className="flex items-center font-bold text-lg text-gray-900">
            <ChefHat className="w-6 h-6 text-orange-600 mr-1" />
            Homie Kitchen
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Compact cart for mobile */}
          <div className="flex items-center space-x-2 bg-white border rounded-lg px-2 py-1 shadow-sm">
            <ShoppingCart className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-sm text-gray-900">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
            <span className="text-xs text-gray-600">${getCartTotal().toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => window.location.href = '/profile'} 
            className={`hidden lg:block p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors ${showMobileMenu ? 'hidden' : ''}`}
          >
            <User className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }} 
            className={`hidden lg:block p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors ${showMobileMenu ? 'hidden' : ''}`}
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button onClick={onShowMobileMenu} className="p-2 rounded hover:bg-gray-100">
            <MenuIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Checkout Button - Fixed at bottom */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={() => setShowCheckout(true)}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors shadow-lg"
          >
            Checkout ({cart.reduce((total, item) => total + item.quantity, 0)} items) - ${getCartTotal().toFixed(2)}
          </button>
        </div>
      )}
      
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                <button onClick={onShowMobileMenu} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Welcome, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
              </div>
              
              <button
                onClick={() => {
                  window.location.href = '/profile';
                  onShowMobileMenu();
                }}
                className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Profile Settings</span>
              </button>
              
              <button
                onClick={() => {
                  onShowOrders();
                  onShowMobileMenu();
                }}
                className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">My Orders</span>
              </button>
              
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    setShowCheckout(true);
                    onShowMobileMenu();
                  }}
                  className="flex items-center space-x-3 w-full p-3 text-left hover:bg-orange-50 rounded-lg bg-orange-50"
                >
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-700 font-medium">Checkout ({cart.reduce((total, item) => total + item.quantity, 0)} items)</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="flex items-center space-x-3 w-full p-3 text-left hover:bg-red-50 rounded-lg text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Checkout Modal Popup */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative mx-2">
            {orderPlaced ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                <p className="text-gray-700 mb-4">Thank you for your order.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="w-16 h-16 text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="absolute top-4 left-4 flex items-center text-orange-600 hover:text-orange-700"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" /> Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Checkout</h2>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-800">Items</span>
                    <span className="font-semibold text-gray-800">Total: ${getCartTotal().toFixed(2)}</span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {cart.map((item, idx) =>
                      item.type === 'set' ? (
                        <li key={idx} className="py-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-orange-700">{item.name} (Set)</span>
                            <span className="font-bold text-orange-700">${item.price.toFixed(2)} × {item.quantity}</span>
                          </div>
                          <ul className="ml-4 mt-1 text-xs text-gray-700 list-disc">
                            {item.items.map(sub => (
                              <li key={sub.id}>{sub.name}</li>
                            ))}
                          </ul>
                          {item.note && (
                            <div className="ml-4 mt-2 text-xs text-gray-500 italic">Note: {item.note}</div>
                          )}
                        </li>
                      ) : (
                        <li key={idx} className="py-3 flex flex-col">
                          <div className="flex justify-between items-center">
                            <span>{item.quantity} × {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          {item.note && (
                            <div className="mt-1 text-xs text-gray-500 italic">Note: {item.note}</div>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 