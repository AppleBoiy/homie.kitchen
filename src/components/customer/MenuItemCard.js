import Image from 'next/image';
import { Image as ImageIcon, Plus, Minus, X } from 'lucide-react';
import { useState } from 'react';

export default function MenuItemCard({ item, onAddToCart, onImageError, hasImageError, cart }) {
  const imageUrl = item.image_url;
  const cartItem = cart?.find(ci => ci.id === item.id && ci.type === 'menu');
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);
  const [note, setNote] = useState(cartItem ? cartItem.note || '' : '');

  const openModal = () => {
    setQuantity(cartItem ? cartItem.quantity : 1);
    setNote(cartItem ? cartItem.note || '' : '');
    setShowModal(true);
  };

  const handleConfirm = () => {
    onAddToCart({ ...item, type: 'menu', quantity, note });
    setShowModal(false);
  };

  return (
    <>
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
          {/* Status badge */}
          <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex flex-col flex-1 p-3 sm:p-4 justify-between">
          <div className="min-h-[90px] flex flex-col justify-start">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{item.name || <span className='text-gray-400'>No name</span>}</h3>
              <span className="text-orange-600 font-bold text-sm sm:text-base ml-2">${item.price.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{item.description || <span className='text-gray-400'>No description</span>}</p>
          </div>
          <button
            onClick={openModal}
            className={`mt-2 px-3 py-1 rounded text-sm font-medium disabled:opacity-50 ${
              cartItem 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
            disabled={!item.is_available}
          >
            {cartItem ? 'Edit Order' : 'Add to Cart'}
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xs p-6 relative mx-2">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Add to Cart</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="font-semibold text-orange-600">${item.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-12 text-center border rounded px-1 py-0.5"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <textarea
                className="w-full border rounded px-2 py-1 text-sm"
                rows={2}
                placeholder="Add a note for admin (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <button
              onClick={handleConfirm}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold text-base hover:bg-orange-700"
            >
              {cartItem ? 'Update Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </>
  );
} 