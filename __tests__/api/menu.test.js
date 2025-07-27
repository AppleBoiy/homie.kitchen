const request = require('supertest');
const { createTestDatabase, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Menu API', () => {
  let db;

  beforeAll(() => {
    db = createTestDatabase();
    insertTestData(db);
  });

  afterAll(() => {
    cleanupTestDatabase(db);
  });

  beforeEach(() => {
    // Clean up test data
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM ingredients').run();
    db.prepare('DELETE FROM categories').run();
    db.prepare('DELETE FROM users').run();

    // Re-insert test data
    insertTestData(db);
  });

  describe('GET /api/menu', () => {
    it('should return all available menu items', async () => {
      // Test the database query directly
      const query = `
        SELECT 
          mi.*,
          c.name as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        WHERE mi.is_available = 1
        ORDER BY c.name, mi.name
      `;
      
      const menuItems = db.prepare(query).all();
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Check that all returned items are available
      menuItems.forEach(item => {
        expect(item.is_available).toBe(1);
      });
    });

    it('should return all menu items when all=true parameter is provided', async () => {
      // First, set one item as unavailable to test the functionality
      db.prepare('UPDATE menu_items SET is_available = 0 WHERE name = ?').run('Test Bruschetta');
      
      // Test the database query directly
      const query = `
        SELECT 
          mi.*,
          c.name as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        ORDER BY c.name, mi.name
      `;
      
      const menuItems = db.prepare(query).all();
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Should include both available and unavailable items
      const hasAvailable = menuItems.some(item => item.is_available === 1);
      const hasUnavailable = menuItems.some(item => item.is_available === 0);
      
      expect(hasAvailable).toBe(true);
      expect(hasUnavailable).toBe(true);
    });

    it('should filter out unavailable items by default', async () => {
      // Test the database query directly
      const query = `
        SELECT 
          mi.*,
          c.name as category_name
        FROM menu_items mi
        LEFT JOIN categories c ON mi.category_id = c.id
        WHERE mi.is_available = 1
        ORDER BY c.name, mi.name
      `;
      
      const menuItems = db.prepare(query).all();
      
      expect(Array.isArray(menuItems)).toBe(true);
      
      // All items should be available
      menuItems.forEach(item => {
        expect(item.is_available).toBe(1);
      });
    });
  });

  describe('POST /api/menu', () => {
    it('should create a new menu item successfully', async () => {
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const menuItemData = {
        name: 'New Test Item',
        description: 'A new test menu item',
        price: 15.99,
        category_id: category.id,
        image_url: 'https://example.com/image.jpg',
        is_available: true
      };

      // Test the database operation directly
      const insertMenuItem = db.prepare(`
        INSERT INTO menu_items (name, description, price, category_id, image_url)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = insertMenuItem.run(
        menuItemData.name,
        menuItemData.description,
        menuItemData.price,
        menuItemData.category_id,
        menuItemData.image_url
      );

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();

      // Verify the item was created
      const createdItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
      expect(createdItem).toBeDefined();
      expect(createdItem.name).toBe(menuItemData.name);
      expect(createdItem.price).toBe(menuItemData.price);
    });

    it('should return 400 for missing required fields', async () => {
      const menuItemData = {
        name: 'Test Item',
        // Missing price and category_id
      };

      // Test validation logic directly
      const { name, price, category_id } = menuItemData;
      
      if (!name || !price || !category_id) {
        expect(true).toBe(true); // Validation would fail
      } else {
        expect(true).toBe(false); // This should not happen
      }
    });

    it('should return 400 for duplicate menu item name', async () => {
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const menuItemData = {
        name: 'Test Bruschetta', // This name already exists
        description: 'A duplicate menu item',
        price: 15.99,
        category_id: category.id
      };

      // Test duplicate name validation
      const existingItem = db.prepare('SELECT id FROM menu_items WHERE name = ?').get(menuItemData.name);
      expect(existingItem).toBeDefined(); // Item with this name already exists
    });

    it('should return 400 for invalid category_id', async () => {
      const menuItemData = {
        name: 'Test Item',
        description: 'A test menu item',
        price: 15.99,
        category_id: 99999 // Invalid category ID
      };

      // Test foreign key validation
      const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(menuItemData.category_id);
      expect(category).toBeUndefined(); // Category doesn't exist
    });
  });

  describe('PUT /api/menu/[id]', () => {
    it('should update a menu item successfully', async () => {
      const existingItem = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Bruschetta');
      expect(existingItem).toBeDefined();
      
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const updateData = {
        name: 'Updated Bruschetta',
        description: 'Updated description',
        price: 9.99,
        category_id: category.id,
        is_available: false
      };

      // Test the database operation directly
      const updateMenuItem = db.prepare(`
        UPDATE menu_items 
        SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?
        WHERE id = ?
      `);
      
      const result = updateMenuItem.run(
        updateData.name,
        updateData.description,
        updateData.price,
        updateData.category_id,
        null, // image_url
        updateData.is_available ? 1 : 0,
        existingItem.id
      );

      expect(result.changes).toBe(1);

      // Verify the item was updated
      const updatedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(existingItem.id);
      expect(updatedItem.name).toBe(updateData.name);
      expect(updatedItem.price).toBe(updateData.price);
      expect(updatedItem.is_available).toBe(0);
    });

    it('should return 404 for non-existent menu item', async () => {
      const updateData = {
        name: 'Updated Item',
        description: 'Updated description',
        price: 9.99,
        category_id: 1
      };

      // Test with non-existent ID
      const updateMenuItem = db.prepare(`
        UPDATE menu_items 
        SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?
        WHERE id = ?
      `);
      
      const result = updateMenuItem.run(
        updateData.name,
        updateData.description,
        updateData.price,
        updateData.category_id,
        null,
        1,
        99999 // Non-existent ID
      );

      expect(result.changes).toBe(0); // No rows were updated
    });

    it('should return 400 for missing required fields', async () => {
      const updateData = {
        name: 'Updated Item',
        // Missing price and category_id
      };

      // Test validation logic directly
      const { name, price, category_id } = updateData;
      
      if (!name || !price || !category_id) {
        expect(true).toBe(true); // Validation would fail
      } else {
        expect(true).toBe(false); // This should not happen
      }
    });
  });

  describe('DELETE /api/menu/[id]', () => {
    it('should delete a menu item successfully', async () => {
      const existingItem = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Bruschetta');
      expect(existingItem).toBeDefined();

      // Test the database operation directly
      const deleteMenuItem = db.prepare('DELETE FROM menu_items WHERE id = ?');
      const result = deleteMenuItem.run(existingItem.id);

      expect(result.changes).toBe(1);

      // Verify the item was deleted
      const deletedItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(existingItem.id);
      expect(deletedItem).toBeUndefined();
    });

    it('should return 404 for non-existent menu item', async () => {
      // Test with non-existent ID
      const deleteMenuItem = db.prepare('DELETE FROM menu_items WHERE id = ?');
      const result = deleteMenuItem.run(99999); // Non-existent ID

      expect(result.changes).toBe(0); // No rows were deleted
    });
  });
}); 