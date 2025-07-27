import { X, Package, Clock, DollarSign, TrendingUp, Warehouse } from 'lucide-react';

export default function MobileStatsPanel({ open, onClose, stats }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-white shadow-lg flex flex-col p-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Dashboard Stats</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Total Orders</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <Clock className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Pending Orders</p>
            <p className="text-xl font-bold text-gray-800">{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <TrendingUp className="w-8 h-8 text-orange-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Menu Items</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalItems}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <Warehouse className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Ingredients</p>
            <p className="text-xl font-bold text-gray-800">{stats.totalIngredients}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow">
          <Package className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-xs font-medium text-gray-600">Low Stock</p>
            <p className="text-xl font-bold text-gray-800">{stats.lowStockIngredients}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 