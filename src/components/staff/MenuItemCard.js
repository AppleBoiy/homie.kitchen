import Image from 'next/image';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';

export default function MenuItemCard({ item, category, onEdit, onDelete, onImageError, hasImageError }) {
  const imageUrl = item.image_url;
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center relative">
        {imageUrl && !hasImageError ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => onImageError(item.id)}
            unoptimized={imageUrl.startsWith('http')}
          />
        ) : (
          <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 sm:p-4 justify-between">
        <div className="min-h-[90px] flex flex-col justify-start">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{item.name || <span className='text-gray-400'>No name</span>}</h3>
            <span className="text-orange-600 font-bold text-sm sm:text-base ml-2">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description || <span className='text-gray-400'>No description</span>}</p>
          <p className="text-gray-500 text-xs mb-3">Category: {category?.name || 'Unknown'}</p>
        </div>
        <div className="flex space-x-2 mt-auto">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-blue-600 text-gray-900 px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 bg-red-600 text-gray-900 px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 