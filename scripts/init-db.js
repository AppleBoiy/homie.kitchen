const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const db = await open({
    filename: 'restaurant.db',
    driver: sqlite3.Database
  });

  // Drop tables if they exist (for clean init)
  await db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS set_menu_items;
    DROP TABLE IF EXISTS set_menus;
    DROP TABLE IF EXISTS menu_items;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);

  // Users
  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin'))
    );
  `);

  // Categories
  await db.exec(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // Menu Items (with type and is_available)
  await db.exec(`
    CREATE TABLE menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      type TEXT DEFAULT 'menu',
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `);

  // Set Menus (independent table)
  await db.exec(`
    CREATE TABLE set_menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Set menu items with quantities
  await db.exec(`
    CREATE TABLE set_menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_menu_id INTEGER,
      menu_item_id INTEGER,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY(set_menu_id) REFERENCES set_menus(id),
      FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
    );
  `);

  // Orders
  await db.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      refund_status TEXT DEFAULT 'none',
      refund_amount REAL DEFAULT 0,
      refund_reason TEXT,
      refunded_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id)
    );
  `);

  await db.exec(`
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      menu_item_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      set_menu_id INTEGER,
      note TEXT,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
      FOREIGN KEY(set_menu_id) REFERENCES set_menus(id)
    );
  `);

  // Sample categories
  await db.run('INSERT INTO categories (name) VALUES (?)', ['Main Course']);
  await db.run('INSERT INTO categories (name) VALUES (?)', ['Drinks']);
  await db.run('INSERT INTO categories (name) VALUES (?)', ['Goods']);

  // Sample menu items (menu, goods, free)
  await db.run('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)', 
    ['Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 16.99, 1, 'menu', 1]);
  await db.run('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)', 
    ['Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 12.99, 1, 'menu', 1]);
  await db.run('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)', 
    ['T-shirt', 'Restaurant branded T-shirt', 9.99, 3, 'goods', 1]);
  await db.run('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)', 
    ['Free Cookie', 'Gift cookie for special customers', 0.00, 1, 'free', 1]);

  // Sample set menu with actual menu items and quantities
  await db.run('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)', 
    ['Lunch Set', 'Burger + Salad + Drink', 25.99, 1]);
  
  const setMenuResult = await db.get('SELECT id FROM set_menus WHERE name = ?', ['Lunch Set']);
  const burgerResult = await db.get('SELECT id FROM menu_items WHERE name = ?', ['Beef Burger']);
  const saladResult = await db.get('SELECT id FROM menu_items WHERE name = ?', ['Caesar Salad']);
  
  await db.run('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)', 
    [setMenuResult.id, burgerResult.id, 1]);
  await db.run('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)', 
    [setMenuResult.id, saladResult.id, 1]);

  // Insert sample admin account
  const adminPassword = bcrypt.hashSync('admin123', 10);
  await db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['admin@homie.kitchen', adminPassword, 'Admin', 'admin']);

  // Insert sample staff account
  const staffPassword = bcrypt.hashSync('staff123', 10);
  await db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['staff@homie.kitchen', staffPassword, 'Staff User', 'staff']);

  // Insert sample customer accounts
  const customerPassword = bcrypt.hashSync('customer123', 10);
  await db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['john@homie.kitchen', customerPassword, 'John Customer', 'customer']);
  await db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['sarah@homie.kitchen', customerPassword, 'Sarah Customer', 'customer']);
  await db.run('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    ['mike@homie.kitchen', customerPassword, 'Mike Customer', 'customer']);

  console.log('Database initialized with sample data!');
  await db.close();
}

// Run the initialization
initDatabase().catch(console.error); 