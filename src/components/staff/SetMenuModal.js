import { useState, useEffect } from 'react';

export default function SetMenuModal({ open, onClose, onSubmit, allItems, initialData, loading }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
    items: [] // Changed from itemIds to items with quantity
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        is_available: initialData.is_available !== undefined ? initialData.is_available : true,
        items: initialData.items ? initialData.items.map(i => ({ 
          menu_item_id: i.id, 
          quantity: i.quantity || 1 
        })) : []
      });
    } else {
      setForm({ name: '', description: '', price: '', is_available: true, items: [] });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleItemToggle = (id, checked) => {
    setForm(f => {
      if (checked) {
        // Add item with default quantity 1
        return { 
          ...f, 
          items: [...f.items, { menu_item_id: id, quantity: 1 }] 
        };
      } else {
        // Remove item
        return { 
          ...f, 
          items: f.items.filter(item => item.menu_item_id !== id) 
        };
      }
    });
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setForm(f => ({
      ...f,
      items: f.items.map(item => 
        item.menu_item_id === itemId 
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  // Group items by type
  const grouped = allItems.reduce((acc, item) => {
    acc[item.type] = acc[item.type] || [];
    acc[item.type].push(item);
    return acc;
  }, {});

  // Helper function to check if item is selected
  const isItemSelected = (itemId) => {
    return form.items.some(item => item.menu_item_id === itemId);
  };

  // Helper function to get item quantity
  const getItemQuantity = (itemId) => {
    const item = form.items.find(item => item.menu_item_id === itemId);
    return item ? item.quantity : 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{initialData ? 'Edit' : 'Add'} Set Menu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_available"
              name="is_available"
              checked={form.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">Available</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items in Set</label>
            <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="mb-3">
                  <div className="font-semibold text-xs text-gray-500 uppercase mb-2">{type}</div>
                  {items.map(item => {
                    const isSelected = isItemSelected(item.id);
                    const quantity = getItemQuantity(item.id);
                    return (
                      <div key={item.id} className="mb-2 p-2 border rounded bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleItemToggle(item.id, e.target.checked)}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                            <span className="text-xs text-gray-500">(${item.price})</span>
                          </label>
                        </div>
                        {isSelected && (
                          <div className="flex items-center space-x-2 ml-6">
                            <label className="text-xs text-gray-600">Quantity:</label>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, quantity - 1)}
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                                disabled={quantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border rounded px-1 py-1 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, quantity + 1)}
                                className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-gray-900 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              disabled={loading}
            >
              {initialData ? 'Update' : 'Add'} Set Menu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 