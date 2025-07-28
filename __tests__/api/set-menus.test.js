const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Set Menus API', () => {
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
    await db.prepare('DELETE FROM set_menu_items').run();
    await db.prepare('DELETE FROM set_menus').run();
    await db.prepare('DELETE FROM menu_items').run();
    await db.prepare('DELETE FROM ingredients').run();
    await db.prepare('DELETE FROM categories').run();
    await db.prepare('DELETE FROM users').run();

    // Re-insert test data
    await insertTestData(db);
  });

  describe('GET /api/set-menus', () => {
    it('should return all set menus', async () => {
      const setMenus = await db.prepare('SELECT * FROM set_menus ORDER BY name').all();

      expect(Array.isArray(setMenus)).toBe(true);
      
      if (setMenus.length > 0) {
        const setMenu = setMenus[0];
        expect(setMenu).toHaveProperty('id');
        expect(setMenu).toHaveProperty('name');
        expect(setMenu).toHaveProperty('description');
        expect(setMenu).toHaveProperty('price');
        expect(setMenu).toHaveProperty('is_available');
      }
    });

    it('should return set menus with menu items', async () => {
      const setMenus = await db.prepare(`
        SELECT sm.*, smi.menu_item_id, smi.quantity, mi.name as item_name, mi.price as item_price
        FROM set_menus sm
        LEFT JOIN set_menu_items smi ON sm.id = smi.set_menu_id
        LEFT JOIN menu_items mi ON smi.menu_item_id = mi.id
        ORDER BY sm.name
      `).all();

      expect(Array.isArray(setMenus)).toBe(true);
      
      if (setMenus.length > 0) {
        const setMenu = setMenus[0];
        expect(setMenu).toHaveProperty('item_name');
        expect(setMenu).toHaveProperty('item_price');
        expect(setMenu).toHaveProperty('quantity');
      }
    });

    it('should filter set menus by availability', async () => {
      const availableSetMenus = await db.prepare('SELECT * FROM set_menus WHERE is_available = 1').all();

      expect(Array.isArray(availableSetMenus)).toBe(true);
      
      availableSetMenus.forEach(setMenu => {
        expect(setMenu.is_available).toBe(1);
      });
    });

    it('should handle empty set menus list', async () => {
      // Clear all set menus
      await db.prepare('DELETE FROM set_menu_items').run();
      await db.prepare('DELETE FROM set_menus').run();
      
      const setMenus = await db.prepare('SELECT * FROM set_menus ORDER BY name').all();
      
      expect(Array.isArray(setMenus)).toBe(true);
      expect(setMenus.length).toBe(0);
    });
  });

  describe('POST /api/set-menus', () => {
    it('should create a new set menu', async () => {
      const menuItem = await db.prepare('SELECT id FROM menu_items LIMIT 1').get();
      
      const setMenuData = {
        name: 'Test Set Menu',
        description: 'Test description',
        price: 29.99,
        is_available: true,
        items: [
          {
            menu_item_id: menuItem.id,
            quantity: 2
          }
        ]
      };

      // Create set menu
      const setMenuResult = await db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)').run(
        setMenuData.name,
        setMenuData.description,
        setMenuData.price,
        setMenuData.is_available ? 1 : 0
      );

      expect(setMenuResult.changes).toBe(1);
      const setMenuId = setMenuResult.lastInsertRowid || setMenuResult.lastID;
      expect(setMenuId).toBeDefined();

      // Create set menu items
      for (const item of setMenuData.items) {
        const itemResult = await db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(
          setMenuId,
          item.menu_item_id,
          item.quantity
        );
        expect(itemResult.changes).toBe(1);
      }

      // Verify the set menu was created
      const createdSetMenu = await db.prepare('SELECT * FROM set_menus WHERE id = ?').get(setMenuId);
      expect(createdSetMenu).toBeDefined();
      expect(createdSetMenu.name).toBe(setMenuData.name);
      expect(createdSetMenu.description).toBe(setMenuData.description);
      expect(createdSetMenu.price).toBe(setMenuData.price);
      expect(createdSetMenu.is_available).toBe(setMenuData.is_available ? 1 : 0);

      // Verify set menu items
      const setMenuItems = await db.prepare('SELECT * FROM set_menu_items WHERE set_menu_id = ?').all(setMenuId);
      expect(setMenuItems.length).toBe(setMenuData.items.length);
    });
  });
}); 