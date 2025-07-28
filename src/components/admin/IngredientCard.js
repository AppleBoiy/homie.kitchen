import { Edit, Trash2, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function IngredientCard({ ingredient, onEdit, onDelete }) {
  // Calculate stock status
  const isLowStock = ingredient.stock_quantity <= ingredient.min_stock_level;
  const isOutOfStock = ingredient.stock_quantity === 0;
  
  // Get status color and icon
  const getStatusInfo = () => {
    if (isOutOfStock) {
      return { color: 'red', icon: AlertTriangle, text: 'Out of Stock', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (isLowStock) {
      return { color: 'orange', icon: AlertTriangle, text: 'Low Stock', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else {
      return { color: 'green', icon: CheckCircle, text: 'In Stock', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${statusInfo.bgColor} ${statusInfo.borderColor} flex flex-col h-full`}>
      {/* Content Area - Takes up available space */}
      <div className="flex-1">
        {/* Header with status indicator */}
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">{ingredient.name}</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 text-${statusInfo.color}-600`} />
              <span className={`text-xs font-medium text-${statusInfo.color}-700`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">{ingredient.unit}</span>
          </div>
        </div>

        {/* Description */}
        {ingredient.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{ingredient.description}</p>
        )}

        {/* Stock Information */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Current Stock:</span>
            <span className={`font-semibold text-base sm:text-lg ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
              {ingredient.stock_quantity}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Min Level:</span>
            <span className="font-medium text-gray-700 text-xs sm:text-sm">{ingredient.min_stock_level}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Always at bottom */}
      <div className="flex space-x-1 sm:space-x-2 mt-3 sm:mt-4">
        <button
          onClick={() => onEdit(ingredient)}
          className="flex-1 bg-slate-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
        >
          <Edit className="w-3 h-3" />
          <span className="hidden sm:inline">Edit</span>
          <span className="sm:hidden">E</span>
        </button>
        <button
          onClick={() => onDelete(ingredient.id)}
          className="flex-1 bg-rose-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span className="hidden sm:inline">Delete</span>
          <span className="sm:hidden">D</span>
        </button>
      </div>
    </div>
  );
} 