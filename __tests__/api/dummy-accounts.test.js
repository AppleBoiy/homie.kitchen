const { createTestDatabase, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Dummy Accounts', () => {
  let db;

  beforeAll(() => {
    db = createTestDatabase();
    insertTestData(db);
  });

  afterAll(() => {
    cleanupTestDatabase(db);
  });

  it('should have dummy staff account', () => {
    const staff = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get('staff@homie.kitchen', 'staff');
    expect(staff).toBeDefined();
    expect(staff.name).toBe('Staff');
    expect(staff.role).toBe('staff');
  });

  it('should have dummy customer accounts', () => {
    const customers = db.prepare('SELECT * FROM users WHERE role = ?').all('customer');
    expect(customers.length).toBeGreaterThanOrEqual(3);
    
    const expectedEmails = ['john@homie.kitchen', 'sarah@homie.kitchen', 'mike@homie.kitchen'];
    const actualEmails = customers.map(c => c.email);
    
    expectedEmails.forEach(email => {
      expect(actualEmails).toContain(email);
    });
  });

  it('should have correct customer names', () => {
    const john = db.prepare('SELECT * FROM users WHERE email = ?').get('john@homie.kitchen');
    const sarah = db.prepare('SELECT * FROM users WHERE email = ?').get('sarah@homie.kitchen');
    const mike = db.prepare('SELECT * FROM users WHERE email = ?').get('mike@homie.kitchen');
    
    expect(john.name).toBe('John Customer');
    expect(sarah.name).toBe('Sarah Customer');
    expect(mike.name).toBe('Mike Customer');
  });

  it('should have hashed passwords for all dummy accounts', () => {
    const allUsers = db.prepare('SELECT * FROM users').all();
    
    allUsers.forEach(user => {
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(10); // bcrypt hash is longer than plain text
      expect(user.password).not.toBe('staff123');
      expect(user.password).not.toBe('customer123');
    });
  });
}); 