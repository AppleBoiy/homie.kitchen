'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!user || !user.id || cart.length === 0) return;
    setPlacingOrder(true);
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
        setOrderPlaced(true);
        setCart([]);
        localStorage.removeItem('cart');
        setTimeout(() => router.push('/orders'), 2000);
      }
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  useEffect(() => {
    // Keep cart in sync with localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-700 mb-4">Thank you for your order. Redirecting to order history...</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <ShoppingCart className="w-16 h-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <button
          onClick={() => router.push('/menu')}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout</h2>
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
                </li>
              ) : (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <span>{item.quantity} × {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
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
      </div>
    </div>
  );
} 