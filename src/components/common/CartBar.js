import { ShoppingCart } from 'lucide-react';

export default function CartBar({ cart, total, onPlaceOrder }) {
  if (!cart || cart.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-2 bg-white shadow-lg rounded-xl flex items-center justify-between p-4 border">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
        <div>
          <p className="font-semibold text-gray-800 text-sm sm:text-base">
            {cart.reduce((total, item) => total + item.quantity, 0)} items
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Total: ${total.toFixed(2)}</p>
        </div>
      </div>
      <button
        onClick={onPlaceOrder}
        className="bg-orange-600 text-gray-900 px-4 sm:px-6 py-2 rounded-lg hover:bg-orange-700 text-sm sm:text-base font-medium transition-colors"
      >
        Place Order
      </button>
    </div>
  );
} 