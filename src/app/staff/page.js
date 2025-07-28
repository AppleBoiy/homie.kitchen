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
  const [loading, setLoading] = useState(true);
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

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery)
  );

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;
  const readyOrders = orders.filter(order => order.status === 'ready').length;
  const lowStockIngredients = ingredients.filter(ingredient => 
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
        </div>
      </div>
    </div>
  );
} 