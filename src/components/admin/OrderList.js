import OrderCard from '@/components/admin/OrderCard';
import SearchBar from '@/components/common/SearchBar';

export default function OrderList({ orders, searchQuery, onSearch, onUpdateStatus, onRefundClick }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search orders by ID, customer, status..."
        />
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-4">No orders match your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="space-y-3 min-w-[320px]">
            {(Array.isArray(orders) ? orders : []).map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={onUpdateStatus} 
                onRefundClick={onRefundClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 