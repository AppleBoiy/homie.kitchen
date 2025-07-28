'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Clock, Image as ImageIcon, Warehouse, Search, X, BarChart3, Menu as MenuIcon } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, safeIncludes } from '@/lib/utils';
import AdminHeader from '@/components/admin/AdminHeader';
import StatsGrid from '@/components/admin/StatsGrid';
import MobileStatsPanel from '@/components/admin/MobileStatsPanel';
import OrderList from '@/components/admin/OrderList';
import MenuList from '@/components/admin/MenuList';
import IngredientList from '@/components/admin/IngredientList';
import MenuItemModal from '@/components/admin/MenuItemModal';
import IngredientModal from '@/components/admin/IngredientModal';
import SetMenuList from '@/components/admin/SetMenuList';
import SetMenuModal from '@/components/admin/SetMenuModal';
import RefundModal from '@/components/admin/RefundModal';

export default function AdminPage() {
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
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
  const [setMenus, setSetMenus] = useState([]);
  const [showSetMenuModal, setShowSetMenuModal] = useState(false);
  const [editingSetMenu, setEditingSetMenu] = useState(null);
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
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(userData);
    fetchData();
  }, [router]);

  // Fetch set menus and all items when Set Menus tab is active
  useEffect(() => {
    if (activeTab === 'setmenus') {
      fetchSetMenus();
      fetchMenuItems(); // all items, not just menu type
    }
  }, [activeTab]);

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
      const response = await fetch('/api/orders?role=admin');
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

  const fetchSetMenus = async () => {
    try {
      const response = await fetch('/api/set-menus');
      const data = await response.json();
      setSetMenus(data);
    } catch (error) {
      console.error('Error fetching set menus:', error);
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

  const handleRefundClick = (order) => {
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

  const handleAddItem = async (form) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category_id: parseInt(form.category_id),
          image_url: form.image_url || null
        })
      });

      if (response.ok) {
        setShowAddItem(false);
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
    }
  };

  const handleUpdateItem = async (form) => {
    try {
      const response = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category_id: parseInt(form.category_id),
          image_url: form.image_url || null
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

  const handleAddIngredient = async (form) => {
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          stock_quantity: parseInt(form.stock_quantity),
          min_stock_level: parseInt(form.min_stock_level),
          unit: form.unit
        })
      });

      if (response.ok) {
        setShowAddIngredient(false);
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleUpdateIngredient = async (form) => {
    try {
      const response = await fetch(`/api/ingredients/${editingIngredient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          stock_quantity: parseInt(form.stock_quantity),
          min_stock_level: parseInt(form.min_stock_level),
          unit: form.unit
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

  const handleAddSetMenu = () => {
    setEditingSetMenu(null);
    setShowSetMenuModal(true);
  };
  const handleEditSetMenu = (setMenu) => {
    setEditingSetMenu(setMenu);
    setShowSetMenuModal(true);
  };
  const handleDeleteSetMenu = async (id) => {
    if (!window.confirm('Delete this set menu?')) return;
    try {
      await fetch('/api/set-menus', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchSetMenus();
    } catch (error) {
      console.error('Error deleting set menu:', error);
    }
  };
  const handleSubmitSetMenu = async (form) => {
    try {
      const method = editingSetMenu ? 'PUT' : 'POST';
      const body = editingSetMenu ? { ...form, id: editingSetMenu.id } : form;
      
      // Convert form.items to the format expected by the API
      const apiBody = {
        ...body,
        items: form.items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        }))
      };
      
      await fetch('/api/set-menus', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody)
      });
      setShowSetMenuModal(false);
      setEditingSetMenu(null);
      fetchSetMenus();
    } catch (error) {
      console.error('Error saving set menu:', error);
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

  // Create safe arrays to prevent errors
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const menuItemsCount = menuItems.filter(item => item.type === 'menu').length;
  const goodsItemsCount = menuItems.filter(item => item.type === 'goods').length;

  // Filter data based on active tab and search query
  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    
    switch (activeTab) {
      case 'orders':
        if (!searchQuery) return safeOrders;
        return safeOrders.filter(order => 
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
        const menuItemsFiltered = menuItems.filter(item => item.type === 'menu');
        if (!searchQuery) return menuItemsFiltered;
        return menuItemsFiltered.filter(item => 
          safeIncludes(item.name, query) ||
          (item.description && safeIncludes(item.description, query)) ||
          safeIncludes(item.price.toString(), query) ||
          categories.find(cat => cat.id === item.category_id)?.name.toLowerCase().includes(query)
        );
      
      case 'goods':
        const goodsItemsFiltered = menuItems.filter(item => item.type === 'goods');
        if (!searchQuery) return goodsItemsFiltered;
        return goodsItemsFiltered.filter(item => 
          safeIncludes(item.name, query) ||
          (item.description && safeIncludes(item.description, query)) ||
          safeIncludes(item.price.toString(), query) ||
          categories.find(cat => cat.id === item.category_id)?.name.toLowerCase().includes(query)
        );
      
      case 'ingredients':
        if (!searchQuery) return safeIngredients;
        return safeIngredients.filter(ingredient => 
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
    totalOrders: safeOrders.length,
    pendingOrders: safeOrders.filter(o => o.status === 'pending').length,
    totalRevenue: safeOrders.reduce((sum, order) => sum + order.total_amount, 0),
    totalMenuItems: menuItemsCount,
    totalGoodsItems: goodsItemsCount,
    totalIngredients: safeIngredients.length,
    lowStockIngredients: safeIngredients.filter(i => i.stock_quantity <= i.min_stock_level).length
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
      <MobileStatsPanel open={mobileStatsOpen} onClose={() => setMobileStatsOpen(false)} stats={stats} />
      <AdminHeader
        user={user}
        onAnalytics={() => router.push('/analytics')}
        onOpenMobileStats={() => setMobileStatsOpen(true)}
        onUserManagement={() => router.push('/users')}
      />
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8">
        <StatsGrid stats={stats} />
        
        {/* Mobile Stats Message */}
        <div className="md:hidden mb-4 space-y-3">
          {/* Stock Status Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Stock Status</h3>
              <BarChart3 className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">In Stock:</span>
                <span className="font-medium text-green-600">
                  {stats.totalIngredients - stats.lowStockIngredients}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-medium text-red-600">{stats.lowStockIngredients}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalIngredients > 0 ? ((stats.totalIngredients - stats.lowStockIngredients) / stats.totalIngredients * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Order Status</h3>
              <TrendingUp className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">
                  {stats.totalOrders - stats.pendingOrders}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-orange-600">{stats.pendingOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 sm:mb-6 lg:mb-8">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6 xl:space-x-8 px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 min-w-max">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 sm:py-4 md:py-4 lg:py-5 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 border-b-2 font-medium text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'orders'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`py-3 sm:py-4 md:py-4 lg:py-5 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 border-b-2 font-medium text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'menu'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Menu Management</span>
                  <span className="sm:hidden">Menu</span>
                </button>
                <button
                  onClick={() => setActiveTab('goods')}
                  className={`py-3 sm:py-4 md:py-4 lg:py-5 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 border-b-2 font-medium text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'goods'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Goods
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-3 sm:py-4 md:py-4 lg:py-5 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 border-b-2 font-medium text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'ingredients'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('setmenus')}
                  className={`py-3 sm:py-4 md:py-4 lg:py-5 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 border-b-2 font-medium text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg whitespace-nowrap transition-colors duration-200 ${
                    activeTab === 'setmenus'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Set Menus</span>
                  <span className="sm:hidden">Sets</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            {activeTab === 'orders' && (
              <>
                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mb-3 sm:mb-4 lg:mb-6 p-2 sm:p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm lg:text-base text-blue-800">
                      Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}

                <OrderList
                  orders={filteredData}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  onUpdateStatus={updateOrderStatus}
                  onRefundClick={handleRefundClick}
                />
              </>
            )}

            {activeTab === 'menu' && (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 md:mb-5 lg:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800">Menu Items</h2>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-orange-600 text-gray-900 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-2.5 lg:py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base md:text-base lg:text-lg"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2" />
                    Add Item
                  </button>
                </div>
                <MenuList
                  items={filteredData}
                  categories={categories}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  onEdit={setEditingItem}
                  onDelete={handleDeleteItem}
                  imageErrors={imageErrors}
                  onImageError={handleImageError}
                />
                <MenuItemModal
                  open={showAddItem || !!editingItem}
                  onClose={() => { setShowAddItem(false); setEditingItem(null); }}
                  onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                  categories={categories}
                  initialData={editingItem}
                  loading={loading}
                  defaultType="menu"
                />
              </>
            )}

            {activeTab === 'goods' && (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 md:mb-5 lg:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800">Goods Items</h2>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-orange-600 text-gray-900 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-2.5 lg:py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base md:text-base lg:text-lg"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2" />
                    Add Item
                  </button>
                </div>
                <MenuList
                  items={filteredData}
                  categories={categories}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  onEdit={setEditingItem}
                  onDelete={handleDeleteItem}
                  imageErrors={imageErrors}
                  onImageError={handleImageError}
                />
                <MenuItemModal
                  open={showAddItem || !!editingItem}
                  onClose={() => { setShowAddItem(false); setEditingItem(null); }}
                  onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                  categories={categories}
                  initialData={editingItem}
                  loading={loading}
                  defaultType="goods"
                />
              </>
            )}

            {activeTab === 'ingredients' && (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 md:mb-5 lg:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800">Ingredients</h2>
                  <button
                    onClick={() => setShowAddIngredient(true)}
                    className="bg-orange-600 text-gray-900 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-2.5 lg:py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base md:text-base lg:text-lg"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2" />
                    Add Ingredient
                  </button>
                </div>
                <IngredientList
                  ingredients={filteredData}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  onEdit={setEditingIngredient}
                  onDelete={handleDeleteIngredient}
                />
                <IngredientModal
                  open={showAddIngredient || !!editingIngredient}
                  onClose={() => { setShowAddIngredient(false); setEditingIngredient(null); }}
                  onSubmit={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                  initialData={editingIngredient}
                  loading={loading}
                />
              </>
            )}

            {activeTab === 'setmenus' && (
              <>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 md:mb-5 lg:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800">Set Menus</h2>
                  <button
                    onClick={handleAddSetMenu}
                    className="bg-orange-600 text-gray-900 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-2.5 lg:py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto text-sm sm:text-base md:text-base lg:text-lg"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-2" />
                    Add Set Menu
                  </button>
                </div>
                <SetMenuList
                  setMenus={setMenus}
                  onEdit={handleEditSetMenu}
                  onDelete={handleDeleteSetMenu}
                  onAdd={handleAddSetMenu}
                />
                <SetMenuModal
                  open={showSetMenuModal}
                  onClose={() => { setShowSetMenuModal(false); setEditingSetMenu(null); }}
                  onSubmit={handleSubmitSetMenu}
                  allItems={menuItems}
                  categories={categories}
                  initialData={editingSetMenu}
                  loading={false}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <RefundModal
        order={selectedOrderForRefund}
        isOpen={showRefundModal}
        onClose={() => { setShowRefundModal(false); setSelectedOrderForRefund(null); }}
        onRefundProcessed={handleRefundProcessed}
      />
    </div>
  );
} 