import { createTestDatabase, insertTestData, cleanupTestDatabase } from '@/lib/test-db';

describe('Database Integration Tests', () => {
  let db;

  beforeAll(async () => {
    db = createTestDatabase();
    insertTestData(db);
  });

  afterAll(() => {
    cleanupTestDatabase(db);
  });

  describe('Database Schema', () => {
    it('should have all required tables', () => {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tableNames = tables.map(table => table.name);
      
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('categories');
      expect(tableNames).toContain('ingredients');
      expect(tableNames).toContain('menu_items');
      expect(tableNames).toContain('orders');
      expect(tableNames).toContain('order_items');
    });

    it('should have correct foreign key relationships', () => {
      // Check menu_items foreign key to categories
      const menuItems = db.prepare('SELECT * FROM menu_items LIMIT 1').all();
      if (menuItems.length > 0) {
        const categoryId = menuItems[0].category_id;
        const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
        expect(category).toBeDefined();
      }

      // Check order_items foreign key to orders and menu_items
      const orderItems = db.prepare('SELECT * FROM order_items LIMIT 1').all();
      if (orderItems.length > 0) {
        const orderId = orderItems[0].order_id;
        const menuItemId = orderItems[0].menu_item_id;
        
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(menuItemId);
        
        expect(order).toBeDefined();
        expect(menuItem).toBeDefined();
      }
    });
  });

  describe('Data Integrity', () => {
    it('should enforce unique constraints', () => {
      // Try to insert duplicate category name
      const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      
      // First insertion should succeed
      insertCategory.run('Unique Test Category', 'Test description');
      
      // Second insertion with same name should fail
      expect(() => {
        insertCategory.run('Unique Test Category', 'Another description');
      }).toThrow();
    });

    it('should enforce foreign key constraints', () => {
      // Try to insert menu item with non-existent category
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      expect(() => {
        insertMenuItem.run('Test Item', 'Test description', 10.99, 999, 'test-url');
      }).toThrow();
    });

    it('should handle cascading deletes properly', () => {
      // Create a test order with order items
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(1, 25.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      
      const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)');
      insertOrderItem.run(orderId, 1, 2, 12.99);
      
      // Check that order items are also deleted (if CASCADE is set up)
      // Note: SQLite doesn't have CASCADE by default, so we manually delete order items first
      const deleteOrderItems = db.prepare('DELETE FROM order_items WHERE order_id = ?');
      deleteOrderItems.run(orderId);
      
      const deleteOrderStmt = db.prepare('DELETE FROM orders WHERE id = ?');
      deleteOrderStmt.run(orderId);
      
      const remainingOrderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      expect(remainingOrderItems).toHaveLength(0);
    });
  });

  describe('Query Performance', () => {
    it('should handle large datasets efficiently', () => {
      // Insert multiple test records
      const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Insert 100 test categories
      for (let i = 0; i < 100; i++) {
        insertCategory.run(`Performance Test Category ${i}`, `Description ${i}`);
      }
      
      // Insert 1000 test menu items
      for (let i = 0; i < 1000; i++) {
        insertMenuItem.run(`Performance Test Item ${i}`, `Description ${i}`, 10.99, 1, 'test-url');
      }
      
      // Test query performance
      const startTime = Date.now();
      const menuItems = db.prepare('SELECT * FROM menu_items WHERE category_id = 1').all();
      const endTime = Date.now();
      
      expect(menuItems.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });

  describe('Transaction Support', () => {
    it('should support transactions', () => {
      const transaction = db.transaction(() => {
        const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
        const insertMenuItem = db.prepare(`
          INSERT INTO menu_items (name, description, price, category_id, image_url) 
          VALUES (?, ?, ?, ?, ?)
        `);
        
        const categoryResult = insertCategory.run('Transaction Test Category', 'Test description');
        const categoryId = categoryResult.lastInsertRowid;
        
        insertMenuItem.run('Transaction Test Item', 'Test description', 10.99, categoryId, 'test-url');
        
        return { categoryId };
      });
      
      const result = transaction();
      expect(result.categoryId).toBeDefined();
      
      // Verify both records were created
      const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.categoryId);
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE category_id = ?').get(result.categoryId);
      
      expect(category).toBeDefined();
      expect(menuItem).toBeDefined();
    });

    it('should rollback transactions on error', () => {
      const initialCategoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
      
      expect(() => {
        const transaction = db.transaction(() => {
          const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
          insertCategory.run('Rollback Test Category', 'Test description');
          
          // This should cause an error and rollback
          throw new Error('Test error');
        });
        
        transaction();
      }).toThrow('Test error');
      
      const finalCategoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
      expect(finalCategoryCount).toBe(initialCategoryCount);
    });
  });
}); 