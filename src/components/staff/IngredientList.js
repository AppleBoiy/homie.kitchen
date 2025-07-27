import IngredientCard from './IngredientCard';
import SearchBar from '@/components/common/SearchBar';

export default function IngredientList({ ingredients, searchQuery, onSearch, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search ingredients by name, description, unit..."
        />
      </div>
      {ingredients.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No ingredients found</h3>
          <p className="text-gray-600 mb-4">No ingredients match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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