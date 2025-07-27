'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ArrowLeft, Plus, Edit, Trash2, Package, Users, DollarSign, TrendingUp, Clock, Image as ImageIcon, Warehouse, Search, X, BarChart3, Menu as MenuIcon } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl, safeIncludes } from '@/lib/utils';
import StaffHeader from '@/components/staff/StaffHeader';
import StatsGrid from '@/components/staff/StatsGrid';
import MobileStatsPanel from '@/components/staff/MobileStatsPanel';
import OrderList from '@/components/staff/OrderList';
import MenuList from '@/components/staff/MenuList';
import IngredientList from '@/components/staff/IngredientList';
import MenuItemModal from '@/components/staff/MenuItemModal';
import IngredientModal from '@/components/staff/IngredientModal';

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
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false);
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
      <MobileStatsPanel open={mobileStatsOpen} onClose={() => setMobileStatsOpen(false)} stats={stats} />
      <StaffHeader
        user={user}
        onAnalytics={() => router.push('/analytics')}
        onOpenMobileStats={() => setMobileStatsOpen(true)}
      />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <StatsGrid stats={stats} />
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 sm:mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-2 sm:px-6">
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

          <div className="p-3 sm:p-6">
            {activeTab === 'orders' && (
              <>
                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800">
                      Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  </div>
                )}

                <OrderList
                  orders={filteredData}
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  onUpdateStatus={updateOrderStatus}
                />
              </>
            )}

            {activeTab === 'menu' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Menu Items</h2>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-orange-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
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
                />
              </>
            )}

            {activeTab === 'ingredients' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Ingredients</h2>
                  <button
                    onClick={() => setShowAddIngredient(true)}
                    className="bg-orange-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
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
          </div>
        </div>
      </div>
    </div>
  );
} 