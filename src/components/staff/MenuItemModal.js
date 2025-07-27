import { useState, useEffect } from 'react';

export default function MenuItemModal({ open, onClose, onSubmit, categories, initialData, loading }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_available: true,
    type: 'menu'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category_id: initialData.category_id || '',
        image_url: initialData.image_url || '',
        is_available: initialData.is_available !== undefined ? initialData.is_available : true,
        type: initialData.type || 'menu'
      });
    } else {
      setForm({ name: '', description: '', price: '', category_id: '', image_url: '', is_available: true, type: 'menu' });
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{initialData ? 'Edit' : 'Add'} Menu Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              disabled={loading}
              style={{color: '#171717', backgroundColor: '#f3f4f6' }}
            >
              <option value="menu">Menu</option>
              <option value="goods">Goods</option>
              <option value="free">Free</option>
            </select>
          </div>
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
              required
              rows="3"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              disabled={form.type !== 'menu'}
              style={form.type !== 'menu' ? { color: '#171717', backgroundColor: '#f3f4f6' } : {}}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
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
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-gray-900 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              disabled={loading}
            >
              {initialData ? 'Update' : 'Add'} Item
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