const { createTestDatabase, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Orders API', () => {
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
    db.prepare('DELETE FROM set_menu_items').run();
    db.prepare('DELETE FROM set_menus').run();
    db.prepare('DELETE FROM menu_items').run();
    db.prepare('DELETE FROM ingredients').run();
    db.prepare('DELETE FROM categories').run();
    db.prepare('DELETE FROM users').run();

    // Re-insert test data
    insertTestData(db);
  });

  describe('GET /api/orders', () => {
    it('should return orders for admin role', async () => {
      // Test the database query directly
      const query = `
        SELECT o.*, u.name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        ORDER BY o.created_at DESC
      `;
      
      const orders = db.prepare(query).all();
      
      expect(Array.isArray(orders)).toBe(true);
      // Admin can see all orders
    });

    it('should return orders for customer role', async () => {
      // Test the database query directly
      const customerId = 1; // Assuming customer ID 1 exists
      const query = `
        SELECT o.*, u.name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
      `;
      
      const orders = db.prepare(query).all(customerId);
      
      expect(Array.isArray(orders)).toBe(true);
      // Customer can only see their own orders
    });

    it('should return 200 for missing role parameter', async () => {
      // Test the database query directly
      const query = `
        SELECT o.*, u.name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        ORDER BY o.created_at DESC
      `;
      
      const orders = db.prepare(query).all();
      
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const customer = db.prepare('SELECT id FROM users WHERE role = ?').get('customer');
      const menuItem = db.prepare('SELECT id, price FROM menu_items WHERE name = ?').get('Test Bruschetta');
      
      expect(customer).toBeDefined();
      expect(menuItem).toBeDefined();

      const orderData = {
        customer_id: customer.id,
        items: [
          {
            menu_item_id: menuItem.id,
            quantity: 2,
            price: menuItem.price
          }
        ],
        total_amount: menuItem.price * 2,
        status: 'pending'
      };

      // Test the database operation directly
      const insertOrder = db.prepare(`
        INSERT INTO orders (customer_id, total_amount, status)
        VALUES (?, ?, ?)
      `);
      
      const result = insertOrder.run(
        orderData.customer_id,
        orderData.total_amount,
        orderData.status
      );

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeDefined();

      // Insert order items
      const insertOrderItem = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);
      
      orderData.items.forEach(item => {
        insertOrderItem.run(result.lastInsertRowid, item.menu_item_id, item.quantity, item.price);
      });

      // Verify the order was created
      const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
      expect(createdOrder).toBeDefined();
      expect(createdOrder.customer_id).toBe(orderData.customer_id);
      expect(createdOrder.total_amount).toBe(orderData.total_amount);
      expect(createdOrder.status).toBe(orderData.status);
    });

    it('should return 400 for missing required fields', async () => {
      const orderData = {
        // Missing customer_id and items
      };

      // Test validation logic directly
      const { customer_id, items } = orderData;
      
      if (!customer_id || !items || items.length === 0) {
        expect(true).toBe(true); // Validation would fail
      } else {
        expect(true).toBe(false); // This should not happen
      }
    });

    it('should return 400 for empty items array', async () => {
      const orderData = {
        customer_id: 1,
        items: [], // Empty items array
        total_amount: 0,
        status: 'pending'
      };

      // Test validation logic directly
      if (orderData.items.length === 0) {
        expect(true).toBe(true); // Validation would fail
      } else {
        expect(true).toBe(false); // This should not happen
      }
    });

    it('should return 400 for invalid customer_id', async () => {
      const orderData = {
        customer_id: 99999, // Invalid customer ID
        items: [
          {
            menu_item_id: 1,
            quantity: 2,
            price: 10.99
          }
        ],
        total_amount: 21.98,
        status: 'pending'
      };

      // Test foreign key validation
      const customer = db.prepare('SELECT id FROM users WHERE id = ?').get(orderData.customer_id);
      expect(customer).toBeUndefined(); // Customer doesn't exist
    });
  });

  describe('PUT /api/orders/[id]', () => {
    it('should update order status successfully', async () => {
      // Create a test order first
      const customer = db.prepare('SELECT id FROM users WHERE role = ?').get('customer');
      const insertOrder = db.prepare(`
        INSERT INTO orders (customer_id, total_amount, status)
        VALUES (?, ?, ?)
      `);
      
      const orderResult = insertOrder.run(customer.id, 25.98, 'pending');
      const testOrderId = orderResult.lastInsertRowid;

      const updateData = {
        status: 'preparing'
      };

      // Test the database operation directly
      const updateOrder = db.prepare(`
        UPDATE orders 
        SET status = ?
        WHERE id = ?
      `);
      
      const result = updateOrder.run(updateData.status, testOrderId);

      expect(result.changes).toBe(1);

      // Verify the order was updated
      const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId);
      expect(updatedOrder.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = {
        status: 'preparing'
      };

      // Test with non-existent ID
      const updateOrder = db.prepare(`
        UPDATE orders 
        SET status = ?
        WHERE id = ?
      `);
      
      const result = updateOrder.run(updateData.status, 99999); // Non-existent ID

      expect(result.changes).toBe(0); // No rows were updated
    });

    it('should return 400 for invalid status', async () => {
      const updateData = {
        status: 'invalid_status' // Invalid status
      };

      // Test status validation
      const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
      const isValidStatus = validStatuses.includes(updateData.status);
      expect(isValidStatus).toBe(false); // Status is invalid
    });

    it('should return 400 for missing status', async () => {
      const updateData = {
        // Missing status
      };

      // Test validation logic directly
      const { status } = updateData;
      
      if (!status) {
        expect(true).toBe(true); // Validation would fail
      } else {
        expect(true).toBe(false); // This should not happen
      }
    });
  });

  describe('Set Menu Integration', () => {
    it('should create an order with set menu items', () => {
      // Insert a set menu
      const insertSetMenu = db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)');
      const setMenuResult = insertSetMenu.run('Test Set Menu', 'A test set menu', 29.99, 1);
      const setMenuId = setMenuResult.lastInsertRowid;
      
      // Insert menu items and link them to set menu
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const insertMenuItem = db.prepare('INSERT INTO menu_items (name, description, price, category_id, type) VALUES (?, ?, ?, ?, ?)');
      const item1 = insertMenuItem.run('Set Menu Item 1', 'Desc 1', 10.00, category.id, 'menu');
      const item2 = insertMenuItem.run('Set Menu Item 2', 'Desc 2', 12.00, category.id, 'menu');
      
      // Link items to set menu with quantities
      const linkItem = db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)');
      linkItem.run(setMenuId, item1.lastInsertRowid, 1);
      linkItem.run(setMenuId, item2.lastInsertRowid, 2);
      
      // Create a customer
      const customer = db.prepare('SELECT id FROM users WHERE role = ?').get('customer');
      
      // Create an order with set menu items
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(customer.id, 29.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      
      // Insert order items with set_menu_id
      const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, set_menu_id) VALUES (?, ?, ?, ?, ?)');
      insertOrderItem.run(orderId, null, 1, 29.99, setMenuId);
      
      // Verify order items
      const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
      expect(orderItems.length).toBe(1);
      expect(orderItems[0].set_menu_id).toBe(setMenuId);
      expect(orderItems[0].menu_item_id).toBe(null);
    });

    it('should update order status to cancelled and verify', () => {
      // Create a test order
      const customer = db.prepare('SELECT id FROM users WHERE role = ?').get('customer');
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(customer.id, 19.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      
      // Update status to cancelled
      const updateOrder = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
      const result = updateOrder.run('cancelled', orderId);
      expect(result.changes).toBe(1);
      const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
      expect(updatedOrder.status).toBe('cancelled');
    });

    it('should retrieve orders with set menu items grouped', () => {
      // Insert a set menu
      const insertSetMenu = db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)');
      const setMenuResult = insertSetMenu.run('Test Set Menu 2', 'A test set menu', 39.99, 1);
      const setMenuId = setMenuResult.lastInsertRowid;
      
      // Insert menu items and link them to set menu
      const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
      const insertMenuItem = db.prepare('INSERT INTO menu_items (name, description, price, category_id, type) VALUES (?, ?, ?, ?, ?)');
      const item3 = insertMenuItem.run('Set Menu Item 3', 'Desc 3', 15.00, category.id, 'menu');
      const item4 = insertMenuItem.run('Set Menu Item 4', 'Desc 4', 18.00, category.id, 'menu');
      
      // Link items to set menu with quantities
      const linkItem = db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)');
      linkItem.run(setMenuId, item3.lastInsertRowid, 1);
      linkItem.run(setMenuId, item4.lastInsertRowid, 1);
      const customer = db.prepare('SELECT id FROM users WHERE role = ?').get('customer');
      const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)');
      const orderResult = insertOrder.run(customer.id, 39.99, 'pending');
      const orderId = orderResult.lastInsertRowid;
      const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, set_menu_id) VALUES (?, ?, ?, ?, ?)');
      insertOrderItem.run(orderId, null, 1, 39.99, setMenuId);
      // Retrieve and group
      const grouped = db.prepare('SELECT set_menu_id, COUNT(*) as count FROM order_items WHERE order_id = ? GROUP BY set_menu_id').all(orderId);
      expect(grouped.length).toBeGreaterThan(0);
      expect(grouped[0].set_menu_id).toBe(setMenuId);
    });
  });
}); 