const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Menu API', () => {
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

  describe('GET /api/menu', () => {
    it('should return all menu items', async () => {
      const menuItems = await db.prepare('SELECT * FROM menu_items ORDER BY name').all();

      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBeGreaterThan(0);
      
      const menuItem = menuItems[0];
      expect(menuItem).toHaveProperty('id');
      expect(menuItem).toHaveProperty('name');
      expect(menuItem).toHaveProperty('description');
      expect(menuItem).toHaveProperty('price');
      expect(menuItem).toHaveProperty('category_id');
    });

    it('should return menu items with category information', async () => {
      const menuItems = await db.prepare(`
        SELECT mi.*, c.name as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        ORDER BY mi.name
      `).all();

      expect(Array.isArray(menuItems)).toBe(true);
      
      if (menuItems.length > 0) {
        const menuItem = menuItems[0];
        expect(menuItem).toHaveProperty('category_name');
      }
    });

    it('should filter menu items by category', async () => {
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      const menuItems = await db.prepare('SELECT * FROM menu_items WHERE category_id = ?').all(category.id);

      expect(Array.isArray(menuItems)).toBe(true);
      
      menuItems.forEach(item => {
        expect(item.category_id).toBe(category.id);
      });
    });

    it('should handle empty menu', async () => {
      // Clear all menu items
      await db.prepare('DELETE FROM menu_items').run();
      
      const menuItems = await db.prepare('SELECT * FROM menu_items ORDER BY name').all();
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBe(0);
    });
  });

  describe('POST /api/menu', () => {
    it('should create a new menu item', async () => {
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      const menuItemData = {
        name: 'Test Menu Item',
        description: 'Test description',
        price: 15.99,
        category_id: category.id,
        image_url: 'test-url'
      };

      const result = await db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        menuItemData.name,
        menuItemData.description,
        menuItemData.price,
        menuItemData.category_id,
        menuItemData.image_url
      );

      expect(result.changes).toBe(1);
      const insertedId = result.lastInsertRowid || result.lastID;
      expect(insertedId).toBeDefined();

      // Verify the menu item was created
      const createdItem = await db.prepare('SELECT * FROM menu_items WHERE id = ?').get(insertedId);
      expect(createdItem).toBeDefined();
      expect(createdItem.name).toBe(menuItemData.name);
      expect(createdItem.description).toBe(menuItemData.description);
      expect(createdItem.price).toBe(menuItemData.price);
      expect(createdItem.category_id).toBe(menuItemData.category_id);
    });

    it('should enforce unique menu item names', async () => {
      const category = await db.prepare('SELECT id FROM categories LIMIT 1').get();
      
      // First insertion
      await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
        'Unique Menu Item', 'Description', 10.99, category.id
      );

      // Second insertion with same name should fail
      await expect(async () => {
        await db.prepare('INSERT INTO menu_items (name, description, price, category_id) VALUES (?, ?, ?, ?)').run(
          'Unique Menu Item', 'Another description', 12.99, category.id
        );
      }).rejects.toThrow();
    });
  });
}); 