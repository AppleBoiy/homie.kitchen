'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ShoppingCart, Plus, Minus, ArrowLeft, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
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
        setCart([]);
        setOrderPlaced(true);
        setTimeout(() => setOrderPlaced(false), 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === parseInt(selectedCategory));

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
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <ChefHat className="w-8 h-8 text-orange-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-800">Homie Kitchen</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Categories</h2>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
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
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
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

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredItems.map(item => {
            const imageUrl = getImageUrl(item.image_url);
            const hasImageError = imageErrors.has(item.id);
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  {imageUrl && !hasImageError ? (
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => handleImageError(item.id)}
                      unoptimized={imageUrl.startsWith('http')}
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <span className="text-orange-600 font-bold">${item.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                  </p>
                  <p className="text-sm text-gray-600">Total: ${getCartTotal().toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={placeOrder}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Message */}
      {orderPlaced && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Order placed successfully!
        </div>
      )}
    </div>
  );
} 