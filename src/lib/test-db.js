import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Create a test database in memory or temporary file
const createTestDatabase = () => {
  // Use in-memory database for tests
  const db = new Database(':memory:');
  
  // Initialize test database with schema only (no default data)
  const initTestDatabase = () => {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('customer', 'staff')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT
      )
    `);

    // Ingredients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        unit TEXT NOT NULL,
        min_stock_level INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        price REAL NOT NULL,
        category_id INTEGER,
        image_url TEXT,
        is_available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Orders table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users (id)
      )
    `);

    // Order items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      )
    `);
  };

  initTestDatabase();
  return db;
};

// Helper function to insert test data
const insertTestData = (db) => {
  // Insert test categories
  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  insertCategory.run('Test Appetizers', 'Test appetizers category');
  insertCategory.run('Test Main Course', 'Test main course category');

  // Insert test ingredients
  const insertIngredient = db.prepare(`
    INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
    VALUES (?, ?, ?, ?, ?)
  `);
  insertIngredient.run('Test Tomatoes', 'Test tomatoes', 50, 'pieces', 10);
  insertIngredient.run('Test Bread', 'Test bread', 30, 'pieces', 5);

  // Get the category ID for menu items
  const category = db.prepare('SELECT id FROM categories WHERE name = ?').get('Test Appetizers');
  
  // Insert test menu items
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id, image_url) 
    VALUES (?, ?, ?, ?, ?)
  `);
  insertMenuItem.run('Test Bruschetta', 'Test bruschetta', 8.99, category.id, 'test-url');
  insertMenuItem.run('Test Salad', 'Test salad', 12.99, category.id, 'test-url');

  // Insert test users
  const hashedPassword = bcrypt.hashSync('test123', 10);
  const insertUser = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  insertUser.run('test@example.com', hashedPassword, 'Test User', 'customer');
  insertUser.run('staff@example.com', hashedPassword, 'Test Staff', 'staff');
};

// Helper function to clean up test database
const cleanupTestDatabase = (db) => {
  if (db) {
    db.close();
  }
};

export { createTestDatabase, insertTestData, cleanupTestDatabase }; 