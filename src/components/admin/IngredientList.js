import IngredientCard from './IngredientCard';
import SearchBar from '@/components/common/SearchBar';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function IngredientList({ ingredients, searchQuery, onSearch, onEdit, onDelete }) {
  // Calculate summary stats
  const totalIngredients = ingredients.length;
  const lowStockIngredients = ingredients.filter(i => i.stock_quantity <= i.min_stock_level).length;
  const outOfStockIngredients = ingredients.filter(i => i.stock_quantity === 0).length;
  const inStockIngredients = totalIngredients - lowStockIngredients;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="mb-3 sm:mb-4">
        <SearchBar
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search ingredients by name, description, unit..."
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{totalIngredients}</div>
          <div className="text-xs text-gray-600">Total Items</div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{inStockIngredients}</div>
          <div className="text-xs text-gray-600">In Stock</div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{lowStockIngredients}</div>
          <div className="text-xs text-gray-600">Low Stock</div>
        </div>
        
        <div className="bg-white rounded-lg border p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{outOfStockIngredients}</div>
          <div className="text-xs text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Ingredients Grid */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">No ingredients found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery ? 'No ingredients match your search.' : 'No ingredients have been added yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {ingredients.map(ingredient => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
} 