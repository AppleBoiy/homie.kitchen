import { Clock, ChefHat, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatsGrid({ pendingOrders, preparingOrders, readyOrders, lowStockIngredients }) {
  const stats = [
    {
      name: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Preparing',
      value: preparingOrders,
      icon: ChefHat,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Ready for Pickup',
      value: readyOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Low Stock Items',
      value: lowStockIngredients,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.name}</p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-semibold ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 