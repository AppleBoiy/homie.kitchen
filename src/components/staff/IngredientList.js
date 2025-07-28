import { useState } from 'react';
import { Package, AlertTriangle, Edit, Save, X } from 'lucide-react';

export default function IngredientList({ ingredients, onUpdateIngredient, userRole }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (ingredient) => {
    setEditingId(ingredient.id);
    setEditForm({
      id: ingredient.id,
      name: ingredient.name,
      description: ingredient.description,
      stock_quantity: ingredient.stock_quantity,
      unit: ingredient.unit,
      min_stock_level: ingredient.min_stock_level
    });
  };

  const handleSave = async () => {
    await onUpdateIngredient(editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStockStatus = (ingredient) => {
    if (ingredient.stock_quantity <= ingredient.min_stock_level) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Low Stock'
      };
    } else if (ingredient.stock_quantity <= ingredient.min_stock_level * 2) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Medium Stock'
      };
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <Package className="w-4 h-4" />,
        text: 'In Stock'
      };
    }
  };

  if (ingredients.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 text-center">
        <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
        <p className="text-sm text-gray-500">Ingredients will appear here when they are added.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Ingredients</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Update stock quantities and monitor inventory levels</p>
      </div>
      <div className="divide-y divide-gray-200">
        {ingredients.map((ingredient) => {
          const stockStatus = getStockStatus(ingredient);
          const isEditing = editingId === ingredient.id;

          return (
            <div key={ingredient.id} className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stockStatus.bgColor}`}>
                    {stockStatus.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">{ingredient.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{ingredient.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                  {userRole === 'staff' && !isEditing && (
                    <button
                      onClick={() => handleEdit(ingredient)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.stock_quantity}
                      onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  ) : (
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                      {ingredient.stock_quantity} {ingredient.unit}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                      {ingredient.unit}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock Level
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.min_stock_level}
                      onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="0"
                    />
                  ) : (
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                      {ingredient.min_stock_level} {ingredient.unit}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 