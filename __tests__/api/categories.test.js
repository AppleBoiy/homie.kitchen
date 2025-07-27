import request from 'supertest';
import { createTestDatabase, insertTestData, cleanupTestDatabase } from '@/lib/test-db';

// Mock the database module
jest.mock('@/lib/db', () => {
  const { createTestDatabase } = require('@/lib/test-db');
  return createTestDatabase();
});

describe('Categories API', () => {
  let db;

  beforeAll(async () => {
    db = require('@/lib/db');
    insertTestData(db);
  });

  afterAll(() => {
    cleanupTestDatabase(db);
  });

  beforeEach(() => {
    // Clear test data before each test (handle foreign key constraints)
    db.prepare('DELETE FROM menu_items WHERE name LIKE ?').run('Test%');
    db.prepare('DELETE FROM categories WHERE name LIKE ?').run('Test%');
    
    // Re-insert test data
    const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
    insertCategory.run('Test Appetizers', 'Test appetizers category');
    insertCategory.run('Test Main Course', 'Test main course category');
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const category = response.body[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });

    it('should return categories ordered by name', async () => {
      const response = await request('http://localhost:3000')
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Check if categories are sorted by name
      const names = response.body.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });
}); 