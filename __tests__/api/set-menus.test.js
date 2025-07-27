const { createTestDatabase, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Set Menus API with Quantities', () => {
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
    db.prepare('DELETE FROM set_menu_items').run();
    db.prepare('DELETE FROM set_menus').run();
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM categories').run();
    
    // Insert test data
    const category = db.prepare('INSERT INTO categories (name) VALUES (?)').run('Test Category');
    const menuItem1 = db.prepare('INSERT INTO menu_items (name, description, price, category_id, type) VALUES (?, ?, ?, ?, ?)').run('Test Item 1', 'Desc 1', 10.00, category.lastInsertRowid, 'menu');
    const menuItem2 = db.prepare('INSERT INTO menu_items (name, description, price, category_id, type) VALUES (?, ?, ?, ?, ?)').run('Test Item 2', 'Desc 2', 15.00, category.lastInsertRowid, 'menu');
  });

  it('should create set menu with item quantities', () => {
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Category');
    const item1 = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Item 1');
    const item2 = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Item 2');

    // Create set menu
    const setMenu = db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)').run('Test Set', 'Test Description', 25.00, 1);
    const setMenuId = setMenu.lastInsertRowid;

    // Add items with quantities
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item1.id, 2);
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item2.id, 1);

    // Verify set menu items
    const setMenuItems = db.prepare(`
      SELECT smi.quantity, mi.name, mi.price
      FROM set_menu_items smi
      JOIN menu_items mi ON smi.menu_item_id = mi.id
      WHERE smi.set_menu_id = ?
    `).all(setMenuId);

    expect(setMenuItems).toHaveLength(2);
    expect(setMenuItems.find(item => item.name === 'Test Item 1').quantity).toBe(2);
    expect(setMenuItems.find(item => item.name === 'Test Item 2').quantity).toBe(1);
  });

  it('should update set menu item quantities', () => {
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Category');
    const item1 = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Item 1');

    // Create set menu
    const setMenu = db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)').run('Test Set', 'Test Description', 25.00, 1);
    const setMenuId = setMenu.lastInsertRowid;

    // Add item with quantity 1
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item1.id, 1);

    // Update quantity to 3
    db.prepare('UPDATE set_menu_items SET quantity = ? WHERE set_menu_id = ? AND menu_item_id = ?').run(3, setMenuId, item1.id);

    // Verify updated quantity
    const updatedItem = db.prepare(`
      SELECT smi.quantity, mi.name
      FROM set_menu_items smi
      JOIN menu_items mi ON smi.menu_item_id = mi.id
      WHERE smi.set_menu_id = ? AND smi.menu_item_id = ?
    `).get(setMenuId, item1.id);

    expect(updatedItem.quantity).toBe(3);
  });

  it('should delete and recreate set menu items when updating', () => {
    const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Category');
    const item1 = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Item 1');
    const item2 = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Test Item 2');

    // Create set menu
    const setMenu = db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)').run('Test Set', 'Test Description', 25.00, 1);
    const setMenuId = setMenu.lastInsertRowid;

    // Add initial items
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item1.id, 1);
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item2.id, 1);

    // Delete all set menu items
    db.prepare('DELETE FROM set_menu_items WHERE set_menu_id = ?').run(setMenuId);

    // Recreate with different quantities
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item1.id, 3);
    db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, item2.id, 2);

    // Verify new quantities
    const setMenuItems = db.prepare(`
      SELECT smi.quantity, mi.name
      FROM set_menu_items smi
      JOIN menu_items mi ON smi.menu_item_id = mi.id
      WHERE smi.set_menu_id = ?
    `).all(setMenuId);

    expect(setMenuItems).toHaveLength(2);
    expect(setMenuItems.find(item => item.name === 'Test Item 1').quantity).toBe(3);
    expect(setMenuItems.find(item => item.name === 'Test Item 2').quantity).toBe(2);
  });
}); 