import { Package, Clock, DollarSign, TrendingUp, Warehouse, ShoppingBag, AlertTriangle, Users, BarChart3 } from 'lucide-react';

export default function StatsGrid({ stats }) {
  // Calculate additional metrics
  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
  const pendingPercentage = stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders * 100) : 0;
  const lowStockPercentage = stats.totalIngredients > 0 ? (stats.lowStockIngredients / stats.totalIngredients * 100) : 0;

  return (
    <div className="hidden md:block space-y-4 sm:space-y-6 lg:space-y-8 mb-4 sm:mb-6 lg:mb-8 xl:mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 xl:p-8 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-700">Stock Status</h3>
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500" />
          </div>
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">In Stock:</span>
              <span className="font-medium text-green-600">
                {stats.totalIngredients - stats.lowStockIngredients}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">Low Stock:</span>
              <span className="font-medium text-red-600">{stats.lowStockIngredients}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5 mt-2 lg:mt-3">
              <div 
                className="bg-green-500 h-1.5 sm:h-2 lg:h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.totalIngredients > 0 ? ((stats.totalIngredients - stats.lowStockIngredients) / stats.totalIngredients * 100) : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6 xl:p-8 lg:col-span-1 xl:col-span-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-700">Order Status</h3>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-500" />
          </div>
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">
                {stats.totalOrders - stats.pendingOrders}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm lg:text-base">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-orange-600">{stats.pendingOrders}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 lg:h-2.5 mt-2 lg:mt-3">
              <div 
                className="bg-orange-500 h-1.5 sm:h-2 lg:h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${pendingPercentage}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 