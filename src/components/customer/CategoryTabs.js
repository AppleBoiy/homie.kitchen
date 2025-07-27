export default function CategoryTabs({ categories, selectedCategory, onSelect }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Categories</h2>
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelect('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm sm:text-base ${
            selectedCategory === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id.toString())}
            className={`px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap text-sm sm:text-base ${
              selectedCategory === category.id.toString()
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 