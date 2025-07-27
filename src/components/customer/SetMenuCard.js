import { Plus, Minus, X } from 'lucide-react';
import { useState } from 'react';

export default function SetMenuCard({ setMenu, onAddToCart, cart }) {
  const cartItem = cart?.find(ci => ci.id === setMenu.id && ci.type === 'set');
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);
  const [note, setNote] = useState(cartItem ? cartItem.note || '' : '');

  const openModal = () => {
    setQuantity(cartItem ? cartItem.quantity : 1);
    setNote(cartItem ? cartItem.note || '' : '');
    setShowModal(true);
  };

  const handleConfirm = () => {
    onAddToCart({
      id: setMenu.id,
      type: 'set',
      setMenuId: setMenu.id,
      name: setMenu.name,
      price: setMenu.price,
      items: setMenu.items,
      quantity,
      note
    });
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{setMenu.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{setMenu.description}</p>
            <span className="text-orange-600 font-bold text-base">${setMenu.price.toFixed(2)}</span>
            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold ${setMenu.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
              {setMenu.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-500 font-semibold mb-1">Items in Set:</div>
            <ul className="text-xs text-gray-700 space-y-1">
              {setMenu.items.map(item => (
                <li key={item.id}>
                  <span className={`inline-block px-2 py-0.5 rounded-full mr-2 text-[10px] font-bold ${
                    item.type === 'menu' ? 'bg-orange-100 text-orange-700' : 
                    item.type === 'goods' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {item.type}
                  </span>
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="ml-2 text-gray-500">×{item.quantity}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={openModal}
          className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors w-full disabled:opacity-50 ${
            cartItem 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
          disabled={!setMenu.is_available}
        >
          {cartItem ? 'Edit Order' : 'Add Set Menu to Cart'}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative mx-2">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Add Set Menu to Cart</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">{setMenu.name}</span>
                <span className="font-semibold text-orange-600">${setMenu.price.toFixed(2)}</span>
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
                placeholder="Add a note for staff (optional)"
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