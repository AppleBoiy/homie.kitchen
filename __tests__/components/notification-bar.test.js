import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBar from '../../src/components/NotificationBar';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
}));

describe('NotificationBar Component', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer'
  };

  // Suppress console.error for cleaner test output
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  const mockOrders = [
    {
      id: 1,
      status: 'pending',
      total_amount: 25.99,
      created_at: '2024-01-01T12:00:00Z',
      items: [
        { id: 1, item_name: 'Test Item', quantity: 2, price: 12.99 }
      ]
    },
    {
      id: 2,
      status: 'preparing',
      total_amount: 15.99,
      created_at: '2024-01-01T12:30:00Z',
      items: [
        { id: 2, item_name: 'Another Item', quantity: 1, price: 15.99 }
      ]
    }
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render notification bell', () => {
    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should fetch active orders on mount', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockOrders
    });

    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/orders?customerId=1&role=customer');
    });
  });

  it('should show active orders notification bar when orders exist', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockOrders
    });

    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('You have 2 active orders')).toBeInTheDocument();
    });
  });

  it('should not show notification bar when no active orders', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => []
    });

    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText(/active order/)).not.toBeInTheDocument();
    });
  });

  it('should call onOrderClick when view orders button is clicked', async () => {
    const mockOnOrderClick = jest.fn();
    fetch.mockResolvedValueOnce({
      json: async () => mockOrders
    });

    render(<NotificationBar user={mockUser} onOrderClick={mockOnOrderClick} />);

    await waitFor(() => {
      const viewOrdersButton = screen.getByText('View Orders →');
      fireEvent.click(viewOrdersButton);
      expect(mockOnOrderClick).toHaveBeenCalled();
    });
  });

  it('should show order status correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockOrders
    });

    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument();
      expect(screen.getByText('Order #2')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Preparing')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<NotificationBar user={mockUser} onOrderClick={() => {}} />);

    // Should not crash and should not show notification bar
    await waitFor(() => {
      expect(screen.queryByText(/active order/)).not.toBeInTheDocument();
    });
  });
}); 