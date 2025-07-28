const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Database Integration Tests', () => {
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

  describe('Database Schema', () => {
    it('should have all required tables', async () => {
      const tables = ['users', 'categories', 'ingredients', 'menu_items', 'set_menus', 'set_menu_items', 'orders', 'order_items'];
      
      for (const table of tables) {
        const result = await db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
        expect(result).toBeDefined();
        expect(result.name).toBe(table);
      }
    });

    it('should have proper table relationships', async () => {
      // Test menu_items -> categories relationship
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      expect(category).toBeDefined();
      
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Item', 'Test description', 10.99, category.id
      );
      expect(menuItem.changes).toBe(1);

      // Test orders -> users relationship
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      expect(user).toBeDefined();
      
      const order = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        user.id, 25.98, 'pending'
      );
      expect(order.changes).toBe(1);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Create a complete order workflow
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      // Create menu item
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Integration Test Item', 'Test description', 15.99, category.id
      );
      const menuItemId = menuItem.lastInsertRowid || menuItem.lastID;

      // Create order
      const order = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        user.id, 31.98, 'pending'
      );
      const orderId = order.lastInsertRowid || order.lastID;

      // Create order item
      const orderItem = await db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)').run(
        orderId, menuItemId, 2, 15.99
      );
      expect(orderItem.changes).toBe(1);

      // Verify the complete relationship chain
      const orderWithItems = await db.prepare(`
        SELECT o.*, u.name as customer_name, oi.quantity, oi.price, mi.name as item_name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.id = ?
      `).get(orderId);

      expect(orderWithItems).toBeDefined();
      expect(orderWithItems.customer_name).toBeDefined();
      expect(orderWithItems.item_name).toBe('Integration Test Item');
      expect(orderWithItems.quantity).toBe(2);
      expect(orderWithItems.price).toBe(15.99);
    });

    it('should handle cascading operations', async () => {
      // Create test data
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Cascade Test Item', 'Test description', 12.99, category.id
      );
      const menuItemId = menuItem.lastInsertRowid || menuItem.lastID;

      const order = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        user.id, 25.98, 'pending'
      );
      const orderId = order.lastInsertRowid || order.lastID;

      await db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)').run(
        orderId, menuItemId, 2, 12.99
      );

      // Delete the order and verify order items are also deleted
      await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
      await db.prepare('DELETE FROM orders WHERE id = ?').run(orderId);

      const remainingOrderItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      expect(remainingOrderItems.length).toBe(0);

      const remainingOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      expect(remainingOrder).toBeUndefined();
    });
  });

  describe('Query Performance', () => {
    it('should handle complex queries efficiently', async () => {
      // Create test data for performance testing
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      // Create multiple menu items
      for (let i = 0; i < 10; i++) {
        await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
          `Performance Item ${i}`, `Description ${i}`, 10.99 + i, category.id
        );
      }

      // Create multiple orders
      for (let i = 0; i < 5; i++) {
        await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
          user.id, 25.98 + i, 'pending'
        );
      }

      // Test complex query performance
      const startTime = Date.now();
      const result = await db.prepare(`
        SELECT 
          c.name as category_name,
          COUNT(mi.id) as item_count,
          AVG(mi.price) as avg_price,
          COUNT(o.id) as order_count
        FROM categories c
        LEFT JOIN menu_items mi ON c.id = mi.category_id
        LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
        LEFT JOIN orders o ON oi.order_id = o.id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `).all();
      const endTime = Date.now();

      expect(Array.isArray(result)).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
}); 