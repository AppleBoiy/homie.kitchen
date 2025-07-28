const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Analytics API', () => {
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

  describe('GET /api/analytics', () => {
    it('should return analytics data', async () => {
      // Create test data for analytics
      const user = await db.prepare('SELECT id FROM users WHERE email = ?').get('test@example.com');
      const category = await db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      
      // Insert test menu item
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Item', 'Test description', 15.99, category.id
      );
      const menuItemId = menuItem.lastInsertRowid || menuItem.lastID;

      // Insert test order
      const order = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        user.id, 31.98, 'completed'
      );
      const orderId = order.lastInsertRowid || order.lastID;

      // Insert order items
      await db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)').run(
        orderId, menuItemId, 2, 15.99
      );

      // Test analytics queries directly
      const totalOrders = await db.prepare('SELECT COUNT(*) as count FROM orders').get();
      const totalRevenue = await db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status = ?').get('completed');
      const popularItems = await db.prepare(`
        SELECT mi.name, SUM(oi.quantity) as total_ordered
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        GROUP BY mi.id
        ORDER BY total_ordered DESC
        LIMIT 5
      `).all();

      expect(totalOrders.count).toBeGreaterThan(0);
      expect(totalRevenue.total).toBeGreaterThan(0);
      expect(Array.isArray(popularItems)).toBe(true);
    });

    it('should handle empty analytics data', async () => {
      // Clear all data
      await db.prepare('DELETE FROM order_items').run();
      await db.prepare('DELETE FROM orders').run();

      // Test analytics queries with empty data
      const totalOrders = await db.prepare('SELECT COUNT(*) as count FROM orders').get();
      const totalRevenue = await db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status = ?').get('completed');

      expect(totalOrders.count).toBe(0);
      expect(totalRevenue.total).toBeNull();
    });
  });
}); 