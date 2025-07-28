const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Dummy Accounts API', () => {
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

  describe('Dummy Account Creation', () => {
    it('should have default admin account', async () => {
      const admin = await db.prepare('SELECT * FROM users WHERE email = ?').get('admin@homie.kitchen');
      
      expect(admin).toBeDefined();
      expect(admin.email).toBe('admin@homie.kitchen');
      expect(admin.name).toBe('Admin');
      expect(admin.role).toBe('admin');
    });

    it('should have default customer accounts', async () => {
      const customers = await db.prepare('SELECT * FROM users WHERE role = ?').all('customer');
      
      expect(customers.length).toBeGreaterThan(0);
      
      const customerEmails = customers.map(c => c.email);
      expect(customerEmails).toContain('john@homie.kitchen');
      expect(customerEmails).toContain('sarah@homie.kitchen');
      expect(customerEmails).toContain('mike@homie.kitchen');
    });

    it('should have hashed passwords', async () => {
      const admin = await db.prepare('SELECT password FROM users WHERE email = ?').get('admin@homie.kitchen');
      
      expect(admin.password).toBeDefined();
      expect(admin.password).not.toBe('admin123'); // Should be hashed
      expect(admin.password.length).toBeGreaterThan(10); // Hash should be longer than plain text
    });
  });

  describe('Account Authentication', () => {
    it('should allow admin login with correct credentials', async () => {
      const admin = await db.prepare('SELECT * FROM users WHERE email = ?').get('admin@homie.kitchen');
      
      expect(admin).toBeDefined();
      expect(admin.role).toBe('admin');
      
      // Test password verification (this would normally use bcrypt.compareSync)
      const bcrypt = require('bcryptjs');
      const isValidPassword = bcrypt.compareSync('admin123', admin.password);
      expect(isValidPassword).toBe(true);
    });

    it('should allow customer login with correct credentials', async () => {
      const customer = await db.prepare('SELECT * FROM users WHERE email = ?').get('john@homie.kitchen');
      
      expect(customer).toBeDefined();
      expect(customer.role).toBe('customer');
      
      // Test password verification
      const bcrypt = require('bcryptjs');
      const isValidPassword = bcrypt.compareSync('customer123', customer.password);
      expect(isValidPassword).toBe(true);
    });
  });
}); 