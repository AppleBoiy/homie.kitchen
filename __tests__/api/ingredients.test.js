const { createTestDatabaseSync, insertTestData, cleanupTestDatabase } = require('../../src/lib/test-db');

describe('Ingredients API', () => {
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

  describe('GET /api/ingredients', () => {
    it('should return all ingredients', async () => {
      const ingredients = await db.prepare('SELECT * FROM ingredients ORDER BY name').all();

      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBeGreaterThan(0);
      
      const ingredient = ingredients[0];
      expect(ingredient).toHaveProperty('id');
      expect(ingredient).toHaveProperty('name');
      expect(ingredient).toHaveProperty('description');
      expect(ingredient).toHaveProperty('stock_quantity');
      expect(ingredient).toHaveProperty('unit');
      expect(ingredient).toHaveProperty('min_stock_level');
    });

    it('should return ingredients ordered by name', async () => {
      const ingredients = await db.prepare('SELECT * FROM ingredients ORDER BY name').all();

      expect(Array.isArray(ingredients)).toBe(true);
      
      // Check if ingredients are sorted by name
      const names = ingredients.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should handle empty ingredients list', async () => {
      // Clear all ingredients
      await db.prepare('DELETE FROM ingredients').run();
      
      const ingredients = await db.prepare('SELECT * FROM ingredients ORDER BY name').all();
      
      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBe(0);
    });

    it('should enforce unique ingredient names', async () => {
      const insertIngredient = db.prepare('INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) VALUES (?, ?, ?, ?, ?)');
      
      // First insertion should succeed
      const result1 = await insertIngredient.run('Unique Ingredient', 'Description', 50, 'kg', 10);
      expect(result1.changes).toBe(1);
      
      // Second insertion with same name should fail
      await expect(async () => {
        await insertIngredient.run('Unique Ingredient', 'Another description', 30, 'pieces', 5);
      }).rejects.toThrow();
    });
  });

  describe('POST /api/ingredients', () => {
    it('should create a new ingredient', async () => {
      const ingredientData = {
        name: 'Test Ingredient',
        description: 'Test description',
        stock_quantity: 100,
        unit: 'pieces',
        min_stock_level: 20
      };

      const result = await db.prepare(`
        INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        ingredientData.name,
        ingredientData.description,
        ingredientData.stock_quantity,
        ingredientData.unit,
        ingredientData.min_stock_level
      );

      expect(result.changes).toBe(1);
      const insertedId = result.lastInsertRowid || result.lastID;
      expect(insertedId).toBeDefined();

      // Verify the ingredient was created
      const createdIngredient = await db.prepare('SELECT * FROM ingredients WHERE id = ?').get(insertedId);
      expect(createdIngredient).toBeDefined();
      expect(createdIngredient.name).toBe(ingredientData.name);
      expect(createdIngredient.description).toBe(ingredientData.description);
      expect(createdIngredient.stock_quantity).toBe(ingredientData.stock_quantity);
      expect(createdIngredient.unit).toBe(ingredientData.unit);
      expect(createdIngredient.min_stock_level).toBe(ingredientData.min_stock_level);
    });
  });
}); 