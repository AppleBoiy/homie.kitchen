import { CheckCircle } from 'lucide-react';

export default function OrderSuccessMessage({ show }) {
  if (!show) return null;
  return (
    <div className="fixed top-4 left-4 right-4 sm:right-4 sm:left-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center z-50">
      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
      <span className="text-sm sm:text-base">Order placed successfully!</span>
    </div>
  );
} 