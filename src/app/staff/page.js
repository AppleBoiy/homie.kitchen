'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Clock, Image as ImageIcon, Warehouse, Search, X } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, safeIncludes } from '@/lib/utils';

export default function StaffPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }
    const userData = JSON.parse(savedUser);
    if (userData.role !== 'staff') {
      router.push('/');
      return;
    }
    setUser(userData);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchOrders(),
        fetchMenuItems(),
        fetchCategories(),
        fetchIngredients()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?role=staff');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu?all=true');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price')),
          category_id: parseInt(formData.get('category_id')),
          image_url: formData.get('image_url') || null
        })
      });

      if (response.ok) {
        setShowAddItem(false);
        e.target.reset();
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price')),
          category_id: parseInt(formData.get('category_id')),
          image_url: formData.get('image_url') || null
        })
      });

      if (response.ok) {
        setEditingItem(null);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          stock_quantity: parseInt(formData.get('stock_quantity')),
          min_stock_level: parseInt(formData.get('min_stock_level')),
          unit: formData.get('unit')
        })
      });

      if (response.ok) {
        setShowAddIngredient(false);
        e.target.reset();
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleUpdateIngredient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch(`/api/ingredients/${editingIngredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          stock_quantity: parseInt(formData.get('stock_quantity')),
          min_stock_level: parseInt(formData.get('min_stock_level')),
          unit: formData.get('unit')
        })
      });

      if (response.ok) {
        setEditingIngredient(null);
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    
    try {
      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter data based on active tab and search query
  const getFilteredData = () => {
    if (!searchQuery) {
      switch (activeTab) {
        case 'orders': return orders;
        case 'menu': return menuItems;
        case 'ingredients': return ingredients;
        default: return [];
      }
    }

    const query = searchQuery.toLowerCase();
    
    switch (activeTab) {
      case 'orders':
        return orders.filter(order => 
          safeIncludes(order.id.toString(), query) ||
          safeIncludes(order.customer_name, query) ||
          safeIncludes(order.customer_email, query) ||
          safeIncludes(order.status, query) ||
          safeIncludes(order.total_amount.toString(), query) ||
          order.items.some(item => 
            safeIncludes(item.item_name, query)
          )
        );
      
      case 'menu':
        return menuItems.filter(item => 
          safeIncludes(item.name, query) ||
          (item.description && safeIncludes(item.description, query)) ||
          safeIncludes(item.price.toString(), query) ||
          categories.find(cat => cat.id === item.category_id)?.name.toLowerCase().includes(query)
        );
      
      case 'ingredients':
        return ingredients.filter(ingredient => 
          safeIncludes(ingredient.name, query) ||
          (ingredient.description && safeIncludes(ingredient.description, query)) ||
          safeIncludes(ingredient.stock_quantity.toString(), query) ||
          (ingredient.unit && safeIncludes(ingredient.unit, query))
        );
      
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    totalItems: menuItems.length,
    totalIngredients: ingredients.length,
    lowStockIngredients: ingredients.filter(i => i.stock_quantity <= i.min_stock_level).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-xl font-bold text-gray-800">Staff Dashboard</h1>
              </div>
            </div>
            <span className="text-gray-600">Welcome, {user?.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Warehouse className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingredients</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalIngredients}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-800">{stats.lowStockIngredients}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ingredients'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ingredients
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'orders' ? 'Search orders by ID, customer, status...' :
                    activeTab === 'menu' ? 'Search menu items by name, description, category...' :
                    'Search ingredients by name, description, unit...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                </div>
                {filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? `No orders match "${searchQuery}"`
                        : 'No orders yet.'
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
                  filteredData.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">{order.customer_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">${order.total_amount}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.item_name}</span>
                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Start Preparing
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Menu Items</h2>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>
                
                {filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No menu items found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? `No menu items match "${searchQuery}"`
                        : 'No menu items yet.'
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map(item => {
                      const imageUrl = getImageUrl(item.image_url);
                      const hasImageError = imageErrors.has(item.id);
                      const category = categories.find(cat => cat.id === item.category_id);
                      
                      return (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                          <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                            {imageUrl && !hasImageError ? (
                              <Image
                                src={imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
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
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            <p className="text-gray-500 text-xs mb-3">Category: {category?.name || 'Unknown'}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Ingredients</h2>
                  <button
                    onClick={() => setShowAddIngredient(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ingredient
                  </button>
                </div>
                
                {filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No ingredients found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery 
                        ? `No ingredients match "${searchQuery}"`
                        : 'No ingredients yet.'
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map(ingredient => (
                      <div key={ingredient.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ingredient.stock_quantity <= ingredient.min_stock_level
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {ingredient.stock_quantity} {ingredient.unit}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{ingredient.description}</p>
                        <p className="text-gray-500 text-xs mb-3">
                          Min Stock: {ingredient.min_stock_level} {ingredient.unit}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingIngredient(ingredient)}
                            className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                            className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Menu Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Menu Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  name="image_url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Menu Item</h2>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingItem.description}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  defaultValue={editingItem.price}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category_id"
                  defaultValue={editingItem.category_id}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  name="image_url"
                  defaultValue={editingItem.image_url}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Update Item
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Ingredient</h2>
            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  name="min_stock_level"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  name="unit"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Add Ingredient
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddIngredient(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {editingIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Ingredient</h2>
            <form onSubmit={handleUpdateIngredient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingIngredient.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingIngredient.description}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  defaultValue={editingIngredient.stock_quantity}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  name="min_stock_level"
                  defaultValue={editingIngredient.min_stock_level}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <input
                  type="text"
                  name="unit"
                  defaultValue={editingIngredient.unit}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                >
                  Update Ingredient
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIngredient(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 