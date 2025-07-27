import { Edit, Trash2 } from 'lucide-react';

export default function IngredientCard({ ingredient, onEdit, onDelete }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
        <span className="text-xs text-gray-500">{ingredient.unit}</span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{ingredient.description}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">Stock: {ingredient.stock_quantity}</span>
        <span className="text-xs text-gray-500">Min: {ingredient.min_stock_level}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(ingredient)}
          className="flex-1 bg-blue-600 text-gray-900 px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </button>
        <button
          onClick={() => onDelete(ingredient.id)}
          className="flex-1 bg-red-600 text-gray-900 px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
} 