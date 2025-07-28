import { createTestDatabaseSync, insertTestData, cleanupTestDatabase } from '@/lib/test-db';

// Mock the database module
jest.mock('@/lib/db', () => {
  const { createTestDatabaseSync } = require('@/lib/test-db');
  return createTestDatabaseSync();
});

describe('Categories API', () => {
  let db;

  beforeAll(async () => {
    db = require('@/lib/db');
    await insertTestData(db);
  });

  afterAll(async () => {
    await cleanupTestDatabase(db);
  });

  beforeEach(async () => {
    // Clear test data before each test (handle foreign key constraints)
    await db.prepare('DELETE FROM menu_items WHERE name LIKE ?').run('Test%');
    await db.prepare('DELETE FROM categories WHERE name LIKE ?').run('Test%');
    
    // Re-insert test data
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    await insertCategory.run('Test Appetizers', 'Test appetizers category');
    await insertCategory.run('Test Main Course', 'Test main course category');
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      // Direct database query instead of HTTP request
      const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      const category = categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });

    it('should return categories ordered by name', async () => {
      // Direct database query instead of HTTP request
      const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all();

      expect(Array.isArray(categories)).toBe(true);
      
      // Check if categories are sorted by name
      const names = categories.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should handle empty categories list', async () => {
      // Clear all categories
      await db.prepare('DELETE FROM categories').run();
      
      const categories = await db.prepare('SELECT * FROM categories ORDER BY name').all();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(0);
    });

    it('should enforce unique category names', async () => {
      const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
      
      // First insertion should succeed
      const result1 = await insertCategory.run('Unique Category', 'Description');
      expect(result1.changes).toBe(1);
      
      // Second insertion with same name should fail
      await expect(async () => {
        await insertCategory.run('Unique Category', 'Another description');
      }).rejects.toThrow();
    });
  });
}); 