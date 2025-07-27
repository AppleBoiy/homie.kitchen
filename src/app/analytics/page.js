'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChefHat, 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [itemsData, setItemsData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, activeTab]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?period=${period}&type=${activeTab}`);
      const data = await response.json();
      
      switch (activeTab) {
        case 'overview':
          setOverviewData(data);
          break;
        case 'sales':
          setSalesData(data);
          break;
        case 'items':
          setItemsData(data);
          break;
        case 'customers':
          setCustomersData(data);
          break;
        case 'inventory':
          setInventoryData(data);
          break;
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 7 Days';
    }
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

  const getStockStatusColor = (percentage) => {
    if (percentage <= 25) return 'text-red-600';
    if (percentage <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-semibold"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              <button
                onClick={fetchAnalyticsData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing data for <span className="font-medium">{getPeriodLabel()}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'sales', label: 'Sales', icon: TrendingUp },
              { id: 'items', label: 'Menu Items', icon: Package },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'inventory', label: 'Inventory', icon: ShoppingCart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && overviewData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(overviewData.revenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(overviewData.orders)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(overviewData.avgOrderValue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(overviewData.activeCustomers)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {overviewData.lowStockItems}
                  </p>
                  <p className="text-sm text-gray-600">items need restocking</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Pending Orders</h3>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {overviewData.pendingOrders}
                  </p>
                  <p className="text-sm text-gray-600">orders in progress</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && salesData && (
          <div className="space-y-8">
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {salesData.timeSeries.map((item, index) => {
                  const maxRevenue = Math.max(...salesData.timeSeries.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-orange-500 rounded-t transition-all duration-300 hover:bg-orange-600"
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-medium text-gray-700">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
                <div className="space-y-3">
                  {salesData.statusDistribution.map((status, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                          {status.status}
                        </div>
                        <span className="text-sm text-gray-600">{status.count} orders</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(status.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Orders</h3>
                <div className="space-y-3">
                  {salesData.timeSeries.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.orders} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && itemsData && (
          <div className="space-y-8">
            {/* Popular Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {itemsData.popularItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.order_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.total_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.total_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
              <div className="space-y-4">
                {itemsData.categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{category.category}</h4>
                      <p className="text-sm text-gray-600">{category.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(category.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && customersData && (
          <div className="space-y-8">
            {/* Top Customers */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Order
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          <span className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900 mr-2 align-middle"></span>
                          Loading customers...
                        </td>
                      </tr>
                    ) : (!Array.isArray(customersData?.topCustomers) || customersData.topCustomers.length === 0) ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          No orders found in this period.
                        </td>
                      </tr>
                    ) : (
                      customersData.topCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.order_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(customer.total_spent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(customer.avg_order_value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'Never'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Acquisition */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Customer Acquisition</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {loading ? (
                  <div className="w-full flex items-center justify-center h-full">
                    <span className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900 mr-2 align-middle"></span>
                    Loading acquisition data...
                  </div>
                ) : (!Array.isArray(customersData?.customerAcquisition) || customersData.customerAcquisition.length === 0) ? (
                  <div className="w-full text-center text-gray-500 py-12">No acquisition data for this period.</div>
                ) : (
                  customersData.customerAcquisition.map((item, index) => {
                    const maxCustomers = Math.max(...customersData.customerAcquisition.map(d => d.new_customers));
                    const height = maxCustomers > 0 ? (item.new_customers / maxCustomers) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%` }}
                        ></div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                          {item.new_customers} new
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && inventoryData && (
          <div className="space-y-8">
            {/* Inventory Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventoryData.stockValue.total_items}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(inventoryData.stockValue.total_quantity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inventoryData.stockValue.low_stock_count}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.lowStockItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock_quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.min_stock_level} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getStockStatusColor(item.stock_percentage)}`}>
                            {item.stock_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Turnover */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Turnover (Last 30 Days)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sold (30d)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.stockTurnover.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.sold_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 