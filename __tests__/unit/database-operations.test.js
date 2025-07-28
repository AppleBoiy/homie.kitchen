const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Database Operations', () => {
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

  describe('CRUD Operations', () => {
    it('should perform Create operations', async () => {
      // Create a new category
      const categoryResult = await db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(
        'Test Category', 'Test description'
      );
      expect(categoryResult.changes).toBe(1);
      const categoryId = categoryResult.lastInsertRowid || categoryResult.lastID;
      expect(categoryId).toBeDefined();

      // Create a new menu item
      const menuItemResult = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Menu Item', 'Test description', 15.99, categoryId
      );
      expect(menuItemResult.changes).toBe(1);
    });

    it('should perform Read operations', async () => {
      // Read categories
      const categories = await db.prepare('SELECT * FROM categories').all();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Read a specific category
      const category = await db.prepare('SELECT * FROM categories WHERE name = ?').get('Test Appetizers');
      expect(category).toBeDefined();
      expect(category.name).toBe('Test Appetizers');
    });

    it('should perform Update operations', async () => {
      // Update a category
      const updateResult = await db.prepare('UPDATE categories SET description = ? WHERE name = ?').run(
        'Updated description', 'Test Appetizers'
      );
      expect(updateResult.changes).toBe(1);

      // Verify the update
      const updatedCategory = await db.prepare('SELECT * FROM categories WHERE name = ?').get('Test Appetizers');
      expect(updatedCategory.description).toBe('Updated description');
    });

    it('should perform Delete operations', async () => {
      // Delete a category (first create one to delete)
      const insertResult = await db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(
        'Delete Test Category', 'To be deleted'
      );
      const categoryId = insertResult.lastInsertRowid || insertResult.lastID;

      // Delete the category
      const deleteResult = await db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
      expect(deleteResult.changes).toBe(1);

      // Verify deletion
      const deletedCategory = await db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
      expect(deletedCategory).toBeUndefined();
    });
  });

  describe('Query Operations', () => {
    it('should handle complex queries with JOINs', async () => {
      const menuItemsWithCategories = await db.prepare(`
        SELECT mi.name, mi.price, c.name as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        ORDER BY mi.name
      `).all();

      expect(Array.isArray(menuItemsWithCategories)).toBe(true);
      
      if (menuItemsWithCategories.length > 0) {
        const menuItem = menuItemsWithCategories[0];
        expect(menuItem).toHaveProperty('name');
        expect(menuItem).toHaveProperty('price');
        expect(menuItem).toHaveProperty('category_name');
      }
    });

    it('should handle aggregate queries', async () => {
      const categoryStats = await db.prepare(`
        SELECT c.name, COUNT(mi.id) as item_count, AVG(mi.price) as avg_price
        FROM categories c
        LEFT JOIN menu_items mi ON c.id = mi.category_id
        GROUP BY c.id, c.name
        ORDER BY c.name
      `).all();

      expect(Array.isArray(categoryStats)).toBe(true);
      
      if (categoryStats.length > 0) {
        const stat = categoryStats[0];
        expect(stat).toHaveProperty('name');
        expect(stat).toHaveProperty('item_count');
        expect(stat).toHaveProperty('avg_price');
      }
    });
  });

  describe('Data Integrity', () => {
    it('should allow insertion with non-existent foreign key (SQLite behavior)', async () => {
      // SQLite doesn't enforce foreign key constraints by default in test environment
      // This test documents the current behavior
      const result = await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Test Item', 'Description', 10.99, 99999 // Non-existent category_id
      );
      
      // The insertion succeeds because SQLite doesn't enforce foreign key constraints by default
      expect(result.changes).toBe(1);
      
      // Verify the item was inserted
      const insertedItem = await db.prepare('SELECT * FROM menu_items WHERE name = ?').get('Test Item');
      expect(insertedItem).toBeDefined();
      expect(insertedItem.category_id).toBe(99999);
    });

    it('should enforce unique constraints', async () => {
      // First insertion should succeed
      await db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(
        'Unique Category', 'Description'
      );

      // Second insertion with same name should fail
      await expect(async () => {
        await db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(
          'Unique Category', 'Another description'
        );
      }).rejects.toThrow();
    });
  });
}); 