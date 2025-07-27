import { useState } from 'react';
import { X, DollarSign, AlertCircle } from 'lucide-react';

export default function RefundModal({ order, isOpen, onClose, onRefundProcessed, mode = 'process' }) {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const isRequestMode = mode === 'request';
  const isProcessMode = mode === 'process';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const requestBody = isRequestMode 
        ? {
            action: 'request_refund',
            refund_reason: refundReason.trim()
          }
        : {
            action: 'process_refund',
            refund_amount: parseFloat(refundAmount),
            refund_reason: refundReason.trim()
          };

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      // Reset form
      setRefundAmount('');
      setRefundReason('');
      
      // Close modal and notify parent
      onClose();
      onRefundProcessed(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setRefundAmount('');
    setRefundReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isRequestMode ? 'Request Refund' : 'Process Refund'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Order Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Order #{order.id}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Customer:</span> {order.customer_name}</p>
            <p><span className="font-medium">Total Amount:</span> ${order.total_amount.toFixed(2)}</p>
            <p><span className="font-medium">Status:</span> {order.status}</p>
            {order.refund_status === 'requested' && (
              <p><span className="font-medium">Refund Status:</span> <span className="text-yellow-600">Requested</span></p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Refund Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isProcessMode && (
            <div>
              <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  id="refundAmount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  max={order.total_amount}
                  required={isProcessMode}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum refund: ${order.total_amount.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 mb-2">
              {isRequestMode ? 'Refund Reason *' : 'Refund Reason *'}
            </label>
            <textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder={isRequestMode ? "Please provide a reason for requesting a refund..." : "Please provide a reason for the refund..."}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !refundReason.trim() || (isProcessMode && !refundAmount)}
              className={`flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isRequestMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isProcessing 
                ? 'Processing...' 
                : isRequestMode 
                  ? 'Request Refund' 
                  : 'Process Refund'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 