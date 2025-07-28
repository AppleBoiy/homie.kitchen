import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Create a wrapper that provides better-sqlite3 API on top of sqlite package
const createBetterSqlite3Wrapper = (db) => {
  return {
    exec: async (sql) => {
      return await db.exec(sql);
    },
    prepare: (sql) => {
      return {
        run: async (...params) => {
          return await db.run(sql, ...params);
        },
        get: async (...params) => {
          return await db.get(sql, ...params);
        },
        all: async (...params) => {
          return await db.all(sql, ...params);
        }
      };
    },
    run: async (sql, ...params) => {
      return await db.run(sql, ...params);
    },
    get: async (sql, ...params) => {
      return await db.get(sql, ...params);
    },
    all: async (sql, ...params) => {
      return await db.all(sql, ...params);
    },
    close: async () => {
      return await db.close();
    }
  };
};

// Create a test database in memory
const createTestDatabase = async () => {
  try {
    // Use in-memory database for tests
    const db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });
    
    // Initialize test database with schema only (no default data)
    const initTestDatabase = async () => {
      // Users table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Categories table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT
        )
      `);

      // Ingredients table
      await db.exec(`
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
      await db.exec(`
        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          price REAL NOT NULL,
          category_id INTEGER,
          image_url TEXT,
          is_available BOOLEAN DEFAULT 1,
          type TEXT DEFAULT 'menu',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Set menus table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS set_menus (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          is_available INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Set menu items with quantities
      await db.exec(`
        CREATE TABLE IF NOT EXISTS set_menu_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          set_menu_id INTEGER,
          menu_item_id INTEGER,
          quantity INTEGER DEFAULT 1,
          FOREIGN KEY (set_menu_id) REFERENCES set_menus(id),
          FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
        )
      `);

      // Orders table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
          refund_status TEXT DEFAULT 'none',
          refund_amount REAL DEFAULT 0,
          refund_reason TEXT,
          refunded_at TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES users (id)
        )
      `);

      // Order items table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          menu_item_id INTEGER,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          set_menu_id INTEGER,
          note TEXT,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (menu_item_id) REFERENCES menu_items (id),
          FOREIGN KEY (set_menu_id) REFERENCES set_menus (id)
        )
      `);
    };

    await initTestDatabase();
    
    // Return a wrapper that provides better-sqlite3 API
    return createBetterSqlite3Wrapper(db);
  } catch (error) {
    console.error('Error creating test database:', error);
    throw error;
  }
};

// Helper function to insert test data
const insertTestData = async (db) => {
  try {
    // Insert test categories
    await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Test Appetizers', 'Test appetizers category']);
    await db.run('INSERT INTO categories (name, description) VALUES (?, ?)', ['Test Main Course', 'Test main course category']);

    // Insert test ingredients
    await db.run('INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) VALUES (?, ?, ?, ?, ?)', 
      ['Test Tomatoes', 'Test tomatoes', 50, 'pieces', 10]);
    await db.run('INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) VALUES (?, ?, ?, ?, ?)', 
      ['Test Bread', 'Test bread', 30, 'pieces', 5]);

    // Get the category ID for menu items
    const category = await db.get('SELECT id FROM categories WHERE name = ?', ['Test Appetizers']);
    
    // Insert test menu items
    await db.run('INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)', 
      ['Test Bruschetta', 'Test bruschetta', 8.99, category.id, 'test-url']);
    await db.run('INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)', 
      ['Test Salad', 'Test salad', 12.99, category.id, 'test-url']);

    // Insert test users (including dummy accounts)
    const hashedPassword = bcrypt.hashSync('test123', 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const customerPassword = bcrypt.hashSync('customer123', 10);
    
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['test@example.com', hashedPassword, 'Test User', 'customer']);
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['admin@example.com', hashedPassword, 'Test Admin', 'admin']);
    
    // Insert dummy accounts (same as init-db.js)
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['admin@homie.kitchen', adminPassword, 'Admin', 'admin']);
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['john@homie.kitchen', customerPassword, 'John Customer', 'customer']);
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['sarah@homie.kitchen', customerPassword, 'Sarah Customer', 'customer']);
    await db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
      ['mike@homie.kitchen', customerPassword, 'Mike Customer', 'customer']);
  } catch (error) {
    console.error('Error inserting test data:', error);
    throw error;
  }
};

// Helper function to clean up test database
const cleanupTestDatabase = async (db) => {
  if (db) {
    try {
      await db.close();
    } catch (error) {
      console.error('Error closing test database:', error);
    }
  }
};

// For backward compatibility with tests that expect a synchronous database
const createTestDatabaseSync = () => {
  let dbInstance = null;
  
  const init = async () => {
    if (!dbInstance) {
      dbInstance = await createTestDatabase();
    }
    return dbInstance;
  };
  
  return {
    exec: async (sql) => {
      const db = await init();
      return await db.exec(sql);
    },
    prepare: (sql) => {
      return {
        run: async (...params) => {
          const db = await init();
          return await db.prepare(sql).run(...params);
        },
        get: async (...params) => {
          const db = await init();
          return await db.prepare(sql).get(...params);
        },
        all: async (...params) => {
          const db = await init();
          return await db.prepare(sql).all(...params);
        }
      };
    },
    run: async (sql, ...params) => {
      const db = await init();
      return await db.run(sql, ...params);
    },
    get: async (sql, ...params) => {
      const db = await init();
      return await db.get(sql, ...params);
    },
    all: async (sql, ...params) => {
      const db = await init();
      return await db.all(sql, ...params);
    },
    close: async () => {
      if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
      }
    }
  };
};

export { createTestDatabase, createTestDatabaseSync, insertTestData, cleanupTestDatabase }; 