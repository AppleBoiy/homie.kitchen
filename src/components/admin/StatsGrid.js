import { Package, Clock, DollarSign, TrendingUp, Warehouse } from 'lucide-react';

export default function StatsGrid({ stats }) {
  return (
    <div className="hidden sm:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 gap-y-4 mb-6 sm:mb-8">
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">{stats.totalOrders}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Menu Items</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">{stats.totalItems}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <Warehouse className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Ingredients</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">{stats.totalIngredients}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg min-h-[120px] flex flex-col justify-center transition-all border p-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-4">
          <Package className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 gap-2">{stats.lowStockIngredients}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 