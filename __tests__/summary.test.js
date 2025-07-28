const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../src/lib/test-db');

describe('Database Summary Test', () => {
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

  describe('Database Schema and Relationships', () => {
    it('should have all required tables', async () => {
      const tables = ['users', 'categories', 'ingredients', 'menu_items', 'set_menus', 'set_menu_items', 'orders', 'order_items'];
      
      for (const table of tables) {
        const result = await db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
        expect(result).toBeDefined();
        expect(result.name).toBe(table);
      }
    });

    it('should have proper foreign key relationships', async () => {
      // Test menu_items -> categories relationship
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      expect(category).toBeDefined();
      
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Item', 'Test description', 10.99, category.id
      );
      expect(menuItem.changes).toBe(1);
    });
  });

  describe('User Management', () => {
    it('should support user registration and authentication', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'customer'
      };

      // Test user creation
      const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      const result = await insertUser.run(userData.email, userData.password, userData.name, userData.role);
      
      expect(result.changes).toBe(1);
      const insertedId = result.lastInsertRowid || result.lastID;
      expect(insertedId).toBeDefined();

      // Test user retrieval
      const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(insertedId);
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
    });

    it('should enforce unique email constraint', async () => {
      const email = 'duplicate@example.com';
      
      // First insertion
      await db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
        email, 'password', 'User 1', 'customer'
      );

      // Second insertion should fail
      await expect(async () => {
        await db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
          email, 'password', 'User 2', 'customer'
        );
      }).rejects.toThrow();
    });
  });

  describe('Menu Management', () => {
    it('should support menu item creation and categorization', async () => {
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      const menuItem = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Menu Item', 'Test description', 15.99, category.id
      );
      
      expect(menuItem.changes).toBe(1);
      
      const insertedId = menuItem.lastInsertRowid || menuItem.lastID;
      const retrievedItem = await db.prepare('SELECT * FROM menu_items WHERE id = ?').get(insertedId);
      expect(retrievedItem).toBeDefined();
      expect(retrievedItem.name).toBe('Test Menu Item');
      expect(retrievedItem.category_id).toBe(category.id);
    });
  });

  describe('Order Management', () => {
    it('should support order creation and tracking', async () => {
      const user = await db.prepare('SELECT id FROM users LIMIT 1').get();
      const menuItem = await db.prepare('SELECT id FROM menu_items LIMIT 1').get();
      
      // Create order
      const order = await db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)').run(
        user.id, 25.98, 'pending'
      );
      
      expect(order.changes).toBe(1);
      const orderId = order.lastInsertRowid || order.lastID;
      
      // Add order items
      const orderItem = await db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)').run(
        orderId, menuItem.id, 2, 12.99
      );
      
      expect(orderItem.changes).toBe(1);
      
      // Verify order with items
      const orderWithItems = await db.prepare(`
        SELECT o.*, oi.quantity, oi.price, mi.name as item_name
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE o.id = ?
      `).get(orderId);
      
      expect(orderWithItems).toBeDefined();
      expect(orderWithItems.quantity).toBe(2);
      expect(orderWithItems.price).toBe(12.99);
    });
  });

  describe('Inventory Management', () => {
    it('should support ingredient stock tracking', async () => {
      const ingredient = await db.prepare('INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) VALUES (?, ?, ?, ?, ?)').run(
        'Test Ingredient', 'Test description', 50, 'kg', 10
      );
      
      expect(ingredient.changes).toBe(1);
      
      const insertedId = ingredient.lastInsertRowid || ingredient.lastID;
      const retrievedIngredient = await db.prepare('SELECT * FROM ingredients WHERE id = ?').get(insertedId);
      expect(retrievedIngredient).toBeDefined();
      expect(retrievedIngredient.stock_quantity).toBe(50);
      expect(retrievedIngredient.unit).toBe('kg');
      expect(retrievedIngredient.min_stock_level).toBe(10);
    });
  });
}); 