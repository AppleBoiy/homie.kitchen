import { createTestDatabase, insertTestData, cleanupTestDatabase } from '@/lib/test-db';

describe('Database Operations Unit Tests', () => {
  let db;

  beforeAll(async () => {
    db = createTestDatabase();
    insertTestData(db);
  });

  afterAll(() => {
    cleanupTestDatabase(db);
  });

  beforeEach(() => {
    // Clear test data before each test (handle foreign key constraints)
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM menu_items').run(); // Delete all menu items first
    db.prepare('DELETE FROM ingredients WHERE name LIKE ?').run('Test%');
    db.prepare('DELETE FROM users WHERE email LIKE ?').run('test%');
    db.prepare('DELETE FROM categories WHERE name LIKE ?').run('Test%');
    
    // Re-insert test data
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCategory.run('Test Appetizers', 'Test appetizers category');
    insertCategory.run('Test Main Course', 'Test main course category');

    const insertIngredient = db.prepare(`
      INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
      VALUES (?, ?, ?, ?, ?)
    `);
    insertIngredient.run('Test Tomatoes', 'Test tomatoes', 50, 'pieces', 10);
    insertIngredient.run('Test Bread', 'Test bread', 30, 'pieces', 5);

    // Get the category ID for menu items
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
    const insertMenuItem = db.prepare(`
      INSERT INTO menu_items (name, description, price, category_id, image_url) 
      VALUES (?, ?, ?, ?, ?)
    `);
    insertMenuItem.run('Test Bruschetta', 'Test bruschetta', 8.99, category.id, 'test-url');
    insertMenuItem.run('Test Salad', 'Test salad', 12.99, category.id, 'test-url');
  });

  describe('Categories Operations', () => {
    it('should create a new category', () => {
      const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      const result = insertCategory.run('New Test Category', 'New category description');
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
      expect(category.name).toBe('New Test Category');
      expect(category.description).toBe('New category description');
    });

    it('should fetch all categories', () => {
      const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      const category = categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });

    it('should enforce unique category names', () => {
      const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      
      // First insertion should succeed
      insertCategory.run('Unique Category', 'Description');
      
      // Second insertion with same name should fail
      expect(() => {
        insertCategory.run('Unique Category', 'Another description');
      }).toThrow();
    });
  });

  describe('Ingredients Operations', () => {
    it('should create a new ingredient', () => {
      const insertIngredient = db.prepare(`
        INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = insertIngredient.run('New Test Ingredient', 'New ingredient', 100, 'kg', 20);
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const ingredient = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(result.lastInsertRowid);
      expect(ingredient.name).toBe('New Test Ingredient');
      expect(ingredient.stock_quantity).toBe(100);
      expect(ingredient.unit).toBe('kg');
      expect(ingredient.min_stock_level).toBe(20);
    });

    it('should update an ingredient', () => {
      const ingredient = db.prepare('SELECT * FROM ingredients WHERE name = ?').get('Test Tomatoes');
      
      const updateIngredient = db.prepare(`
        UPDATE ingredients 
        SET name = ?, description = ?, stock_quantity = ?, unit = ?, min_stock_level = ?
        WHERE id = ?
      `);
      const result = updateIngredient.run('Updated Tomatoes', 'Updated description', 75, 'pieces', 15, ingredient.id);
      
      expect(result.changes).toBe(1);
      
      const updatedIngredient = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ingredient.id);
      expect(updatedIngredient.name).toBe('Updated Tomatoes');
      expect(updatedIngredient.stock_quantity).toBe(75);
    });

    it('should delete an ingredient', () => {
      const ingredient = db.prepare('SELECT * FROM ingredients WHERE name = ?').get('Test Tomatoes');
      
      const deleteIngredient = db.prepare('DELETE FROM ingredients WHERE id = ?');
      const result = deleteIngredient.run(ingredient.id);
      
      expect(result.changes).toBe(1);
      
      const deletedIngredient = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ingredient.id);
      expect(deletedIngredient).toBeUndefined();
    });

    it('should enforce unique ingredient names', () => {
      const insertIngredient = db.prepare(`
        INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // First insertion should succeed
      insertIngredient.run('Unique Ingredient', 'Description', 50, 'pieces', 10);
      
      // Second insertion with same name should fail
      expect(() => {
        insertIngredient.run('Unique Ingredient', 'Another description', 100, 'kg', 20);
      }).toThrow();
    });
  });

  describe('Menu Items Operations', () => {
    it('should create a new menu item', () => {
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `);
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const result = insertMenuItem.run('New Test Item', 'New item description', 15.99, category.id, 'new-url');
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
      expect(menuItem.name).toBe('New Test Item');
      expect(menuItem.price).toBe(15.99);
      expect(menuItem.category_id).toBe(category.id);
      expect(menuItem.is_available).toBe(1);
    });

    it('should update a menu item', () => {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE name = ?').get('Test Bruschetta');
      
      const updateMenuItem = db.prepare(`
        UPDATE menu_items 
        SET name = ?, description = ?, price = ?, category_id = ?, is_available = ?
        WHERE id = ?
      `);
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const result = updateMenuItem.run('Updated Bruschetta', 'Updated description', 9.99, category.id, 0, menuItem.id);
      
      expect(result.changes).toBe(1);
      
      const updatedMenuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(menuItem.id);
      expect(updatedMenuItem.name).toBe('Updated Bruschetta');
      expect(updatedMenuItem.price).toBe(9.99);
      expect(updatedMenuItem.is_available).toBe(0);
    });

    it('should delete a menu item', () => {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE name = ?').get('Test Bruschetta');
      
      const deleteMenuItem = db.prepare('DELETE FROM menu_items WHERE id = ?');
      const result = deleteMenuItem.run(menuItem.id);
      
      expect(result.changes).toBe(1);
      
      const deletedMenuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(menuItem.id);
      expect(deletedMenuItem).toBeUndefined();
    });

    it('should enforce unique menu item names', () => {
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      
      // First insertion should succeed
      insertMenuItem.run('Unique Menu Item', 'Description', 10.99, category.id, 'url');
      
      // Second insertion with same name should fail
      expect(() => {
        insertMenuItem.run('Unique Menu Item', 'Another description', 15.99, category.id, 'another-url');
      }).toThrow();
    });

    it('should enforce foreign key constraints', () => {
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      // Should fail with non-existent category_id
      expect(() => {
        insertMenuItem.run('Invalid Category Item', 'Description', 10.99, 999, 'url');
      }).toThrow();
    });
  });

  describe('Orders Operations', () => {
    let testUserId;

    beforeEach(() => {
      // Create a test user for orders
      const hashedPassword = require('bcryptjs').hashSync('test123', 10);
      const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      const userResult = insertUser.run(`ordertest${Date.now()}@example.com`, hashedPassword, 'Order Test User', 'customer');
      testUserId = userResult.lastInsertRowid;
    });

    it('should create a new order', () => {
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const result = insertOrder.run(testUserId, 25.99, 'pending');
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
      expect(order.customer_id).toBe(testUserId);
      expect(order.total_amount).toBe(25.99);
      expect(order.status).toBe('pending');
    });

    it('should create order items', () => {
      // Create order
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(testUserId, 25.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      
      // Create order item
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE name = ?').get('Test Bruschetta');
      const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)');
      const result = insertOrderItem.run(orderId, menuItem.id, 2, 12.99);
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const orderItem = db.prepare('SELECT * FROM order_items WHERE id = ?').get(result.lastInsertRowid);
      expect(orderItem.order_id).toBe(orderId);
      expect(orderItem.menu_item_id).toBe(menuItem.id);
      expect(orderItem.quantity).toBe(2);
      expect(orderItem.price).toBe(12.99);
    });

    it('should update order status', () => {
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(testUserId, 25.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      
      const updateOrder = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
      const result = updateOrder.run('preparing', orderId);
      
      expect(result.changes).toBe(1);
      
      const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      expect(updatedOrder.status).toBe('preparing');
    });

    it('should enforce foreign key constraints for orders', () => {
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      
      // Should fail with non-existent customer_id
      expect(() => {
        insertOrder.run(999, 25.99, 'pending');
      }).toThrow();
    });
  });

  describe('User Operations', () => {
    it('should create a new user', () => {
      const hashedPassword = require('bcryptjs').hashSync('password123', 10);
      const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      const result = insertUser.run('newuser@example.com', hashedPassword, 'New User', 'customer');
      
      expect(result.lastInsertRowid).toBeDefined();
      
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      expect(user.email).toBe('newuser@example.com');
      expect(user.name).toBe('New User');
      expect(user.role).toBe('customer');
      expect(user.password).toBe(hashedPassword);
    });

    it('should enforce unique email constraints', () => {
      const hashedPassword = require('bcryptjs').hashSync('password123', 10);
      const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      
      // First insertion should succeed
      insertUser.run('unique@example.com', hashedPassword, 'First User', 'customer');
      
      // Second insertion with same email should fail
      expect(() => {
        insertUser.run('unique@example.com', hashedPassword, 'Second User', 'admin');
      }).toThrow();
    });

    it('should enforce role constraints', () => {
      const hashedPassword = require('bcryptjs').hashSync('password123', 10);
      const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      
      // Should fail with invalid role
      expect(() => {
        insertUser.run('invalid@example.com', hashedPassword, 'Invalid User', 'invalid_role');
      }).toThrow();
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
      
      // Insert 50 test categories
      for (let i = 0; i < 50; i++) {
        insertCategory.run(`Performance Test Category ${i}`, `Description ${i}`);
      }
      
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      
      // Insert 100 test menu items
      for (let i = 0; i < 100; i++) {
        insertMenuItem.run(`Performance Test Item ${i}`, `Description ${i}`, 10.99, category.id, 'test-url');
      }
      
      // Test query performance
      const startTime = Date.now();
      const menuItems = db.prepare('SELECT * FROM menu_items WHERE category_id = ?').all(category.id);
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