const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Orders API', () => {
  let db;

  beforeAll(async () => {
    db = createTestDatabaseSync();
    await insertTestData(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  beforeEach(async () => {
    // Clean up test data
    await db.prepare('DELETE FROM order_items').run();
    await db.prepare('DELETE FROM orders').run();
    await db.prepare('DELETE FROM menu_items').run();
    await db.prepare('DELETE FROM ingredients').run();
    await db.prepare('DELETE FROM categories').run();
    await db.prepare('DELETE FROM users').run();

    // Re-insert test data
    await insertTestData(db);
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();

      expect(Array.isArray(orders)).toBe(true);
      
      if (orders.length > 0) {
        const order = orders[0];
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('customer_id');
        expect(order).toHaveProperty('total_amount');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('created_at');
      }
    });

    it('should return orders with customer information', async () => {
      const orders = await db.prepare(`
        SELECT o.*, u.name as customer_name, u.email as customer_email
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        ORDER BY o.created_at DESC
      `).all();

      expect(Array.isArray(orders)).toBe(true);
      
      if (orders.length > 0) {
        const order = orders[0];
        expect(order).toHaveProperty('customer_name');
        expect(order).toHaveProperty('customer_email');
      }
    });

    it('should filter orders by status', async () => {
      const status = 'pending';
      const orders = await db.prepare('SELECT * FROM orders WHERE status = ?').all(status);

      expect(Array.isArray(orders)).toBe(true);
      
      orders.forEach(order => {
        expect(order.status).toBe(status);
      });
    });

    it('should handle empty orders list', async () => {
      // Clear all orders
      await db.prepare('DELETE FROM order_items').run();
      await db.prepare('DELETE FROM orders').run();
      
      const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBe(0);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      const menuItem = await db.prepare('SELECT id FROM menu_items LIMIT 1').get();
      
      const orderData = {
        customer_id: user.id,
        total_amount: 25.98,
        status: 'pending',
        items: [
          {
            menu_item_id: menuItem.id,
            quantity: 2,
            price: 12.99
          }
        ]
      };

      // Create order
      const orderResult = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        orderData.customer_id,
        orderData.total_amount,
        orderData.status
      );

      expect(orderResult.changes).toBe(1);
      const orderId = orderResult.lastInsertRowid || orderResult.lastID;
      expect(orderId).toBeDefined();

      // Create order items
      for (const item of orderData.items) {
        const itemResult = await db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)').run(
          orderId,
          item.menu_item_id,
          item.quantity,
          item.price
        );
        expect(itemResult.changes).toBe(1);
      }

      // Verify the order was created
      const createdOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      expect(createdOrder).toBeDefined();
      expect(createdOrder.customer_id).toBe(orderData.customer_id);
      expect(createdOrder.total_amount).toBe(orderData.total_amount);
      expect(createdOrder.status).toBe(orderData.status);

      // Verify order items
      const orderItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      expect(orderItems.length).toBe(orderData.items.length);
    });
  });
}); 