import { createTestDatabase, cleanupTestDatabase } from '@/lib/test-db';
import db from '@/lib/db';

// Mock the database module
jest.mock('@/lib/db', () => {
  let testDb = null;
  return {
    __esModule: true,
    default: {
      prepare: jest.fn((query) => {
        if (!testDb) {
          testDb = createTestDatabase();
        }
        return testDb.prepare(query);
      }),
      exec: jest.fn((query) => {
        if (!testDb) {
          testDb = createTestDatabase();
        }
        return testDb.exec(query);
      })
    }
  };
});

describe('Refund API', () => {
  let testDb;

  beforeEach(() => {
    testDb = createTestDatabase();
    // Mock the db module to use our test database
    jest.spyOn(db, 'prepare').mockImplementation((query) => testDb.prepare(query));
    jest.spyOn(db, 'exec').mockImplementation((query) => testDb.exec(query));
  });

  afterEach(() => {
    cleanupTestDatabase(testDb);
    jest.clearAllMocks();
  });

  describe('PUT /api/orders/[id] - Process Refund', () => {
    it('should process a refund successfully', async () => {
      // Create test data
      const customer = testDb.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('test@example.com', 'hashedpassword', 'Test Customer', 'customer');
      const order = testDb.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(customer.lastInsertRowid, 25.99, 'completed');
      
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 15.99,
          refund_reason: 'Customer requested partial refund'
        })
      };

      const response = await PUT(request, { params: { id: order.lastInsertRowid } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Refund processed successfully');
      expect(data.order.refund_status).toBe('refunded');
      expect(data.order.refund_amount).toBe(15.99);
      expect(data.order.refund_reason).toBe('Customer requested partial refund');
      expect(data.order.refunded_at).toBeDefined();
    });

    it('should reject refund for non-existent order', async () => {
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 15.99,
          refund_reason: 'Customer requested partial refund'
        })
      };

      const response = await PUT(request, { params: { id: 999 } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });

    it('should reject refund with invalid amount', async () => {
      // Create test data
      const customer = testDb.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('test@example.com', 'hashedpassword', 'Test Customer', 'customer');
      const order = testDb.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(customer.lastInsertRowid, 25.99, 'completed');
      
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 0,
          refund_reason: 'Customer requested partial refund'
        })
      };

      const response = await PUT(request, { params: { id: order.lastInsertRowid } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Valid refund amount is required');
    });

    it('should reject refund with amount exceeding order total', async () => {
      // Create test data
      const customer = testDb.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('test@example.com', 'hashedpassword', 'Test Customer', 'customer');
      const order = testDb.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(customer.lastInsertRowid, 25.99, 'completed');
      
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 30.00,
          refund_reason: 'Customer requested partial refund'
        })
      };

      const response = await PUT(request, { params: { id: order.lastInsertRowid } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Refund amount cannot exceed order total');
    });

    it('should reject refund without reason', async () => {
      // Create test data
      const customer = testDb.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('test@example.com', 'hashedpassword', 'Test Customer', 'customer');
      const order = testDb.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(customer.lastInsertRowid, 25.99, 'completed');
      
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 15.99,
          refund_reason: ''
        })
      };

      const response = await PUT(request, { params: { id: order.lastInsertRowid } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Refund reason is required');
    });

    it('should reject refund for already refunded order', async () => {
      // Create test data
      const customer = testDb.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run('test@example.com', 'hashedpassword', 'Test Customer', 'customer');
      const order = testDb.prepare('INSERT INTO orders (customer_id, total_amount, status, refund_status, refund_amount, refund_reason) VALUES (?, ?, ?, ?, ?, ?)').run(customer.lastInsertRowid, 25.99, 'completed', 'refunded', 15.99, 'Previous refund');
      
      const { PUT } = require('@/app/api/orders/[id]/route');
      
      const request = {
        json: jest.fn().mockResolvedValue({
          refund_amount: 10.00,
          refund_reason: 'Customer requested another refund'
        })
      };

      const response = await PUT(request, { params: { id: order.lastInsertRowid } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Order is already refunded');
    });
  });
}); 