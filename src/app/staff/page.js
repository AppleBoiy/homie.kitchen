'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle, Search, LogOut, BarChart3 } from 'lucide-react';
import OrderList from '@/components/staff/OrderList';
import IngredientList from '@/components/staff/IngredientList';
import StaffHeader from '@/components/staff/StaffHeader';
import StatsGrid from '@/components/staff/StatsGrid';

export default function StaffPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [setMenus, setSetMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
        fetchIngredients(),
        fetchSetMenus(),
        fetchCategories()
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

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchSetMenus = async () => {
    try {
      const response = await fetch('/api/set-menus');
      const data = await response.json();
      setSetMenus(data);
    } catch (error) {
      console.error('Error fetching set menus:', error);
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
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

  const handleUpdateIngredient = async (form) => {
    try {
      const response = await fetch(`/api/ingredients/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          stock_quantity: parseInt(form.stock_quantity),
          unit: form.unit,
          min_stock_level: parseInt(form.min_stock_level)
        })
      });

      if (response.ok) {
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };

  const handleToggleMenuItemAvailability = async (itemId, isAvailable) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable })
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating menu item availability:', error);
    }
  };

  const handleToggleSetMenuAvailability = async (setMenuId, isAvailable) => {
    try {
      const response = await fetch('/api/set-menus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: setMenuId, 
          is_available: isAvailable 
        })
      });

      if (response.ok) {
        fetchSetMenus();
      }
    } catch (error) {
      console.error('Error updating set menu availability:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredOrders = safeOrders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  const filteredIngredients = safeIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMenuItems = safeMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'goods' && item.type === 'goods') ||
      (selectedCategory === 'menu' && (item.type === 'menu' || item.type === 'free')) ||
      (selectedCategory !== 'all' && selectedCategory !== 'goods' && selectedCategory !== 'menu' && 
       safeCategories.find(cat => cat.id === parseInt(selectedCategory))?.id === item.category_id);
    
    return matchesSearch && matchesCategory;
  });

  const safeSetMenus = Array.isArray(setMenus) ? setMenus : [];
  const filteredSetMenus = safeSetMenus.filter(setMenu => {
    const matchesSearch = setMenu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (setMenu.description && setMenu.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all';
    
    return matchesSearch && matchesCategory;
  });

  // Separate items by type
  const goodsItems = filteredMenuItems.filter(item => item.type === 'goods');
  const foodMenuItems = filteredMenuItems.filter(item => item.type === 'menu' || item.type === 'free');

  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;
  const preparingOrders = safeOrders.filter(order => order.status === 'preparing').length;
  const readyOrders = safeOrders.filter(order => order.status === 'ready').length;
  const lowStockIngredients = safeIngredients.filter(ingredient => 
    ingredient.stock_quantity <= ingredient.min_stock_level
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Grid */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <StatsGrid 
            pendingOrders={pendingOrders}
            preparingOrders={preparingOrders}
            readyOrders={readyOrders}
            lowStockIngredients={lowStockIngredients}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search orders or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
              {pendingOrders > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {pendingOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Ingredients</span>
              <span className="sm:hidden">Stock</span>
              {lowStockIngredients > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                  {lowStockIngredients}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Menu Items</span>
              <span className="sm:hidden">Menu</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'orders' && (
            <OrderList 
              orders={filteredOrders}
              onUpdateStatus={updateOrderStatus}
              userRole="staff"
            />
          )}
          {activeTab === 'ingredients' && (
            <IngredientList 
              ingredients={filteredIngredients}
              onUpdateIngredient={handleUpdateIngredient}
              userRole="staff"
            />
          )}
          {activeTab === 'menu' && (
            <div className="p-4 sm:p-6">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedCategory === 'all'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setSelectedCategory('menu')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedCategory === 'menu'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Food & Drinks
                  </button>
                  <button
                    onClick={() => setSelectedCategory('goods')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedCategory === 'goods'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Goods
                  </button>
                  {safeCategories.filter(cat => cat.name !== 'Goods').map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        selectedCategory === category.id.toString()
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food & Drinks Section */}
              {foodMenuItems.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    Food & Drinks ({foodMenuItems.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {foodMenuItems.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <span className="text-sm font-semibold text-orange-600">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {safeCategories.find(cat => cat.id === item.category_id)?.name || 'Unknown'} • {item.type}
                          </span>
                          <button
                            onClick={() => handleToggleMenuItemAvailability(item.id, !item.is_available)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              item.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goods Section */}
              {goodsItems.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    Goods ({goodsItems.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goodsItems.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <span className="text-sm font-semibold text-orange-600">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {safeCategories.find(cat => cat.id === item.category_id)?.name || 'Unknown'} • {item.type}
                          </span>
                          <button
                            onClick={() => handleToggleMenuItemAvailability(item.id, !item.is_available)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              item.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Set Menus Section */}
              {filteredSetMenus.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    Set Menus ({filteredSetMenus.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSetMenus.map(setMenu => (
                      <div key={setMenu.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{setMenu.name}</h3>
                          <span className="text-sm font-semibold text-orange-600">${setMenu.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{setMenu.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {setMenu.category_name || 'Uncategorized'} • {setMenu.items?.length || 0} items
                          </span>
                          <button
                            onClick={() => handleToggleSetMenuAvailability(setMenu.id, !setMenu.is_available)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              setMenu.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {setMenu.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Items Message */}
              {filteredMenuItems.length === 0 && filteredSetMenus.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No items found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 