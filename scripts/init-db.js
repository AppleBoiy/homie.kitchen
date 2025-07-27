const Database = require('better-sqlite3');
const db = new Database('restaurant.db');

// Drop tables if they exist (for clean init)
db.exec(`
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS set_menu_items;
DROP TABLE IF EXISTS set_menus;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
`);

// Users
db.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL
);
`);

// Categories
db.exec(`
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
`);

// Menu Items (with type and is_available)
db.exec(`
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
db.exec(`
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
db.exec(`
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
db.exec(`
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

db.exec(`
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  menu_item_id INTEGER,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  set_menu_id INTEGER,
  FOREIGN KEY(order_id) REFERENCES orders(id),
  FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
  FOREIGN KEY(set_menu_id) REFERENCES set_menus(id)
);
`);

// Ensure 'note' column exists in order_items (migration for legacy DBs)
try {
  db.prepare('ALTER TABLE order_items ADD COLUMN note TEXT').run();
} catch (e) {
  // Ignore error if column already exists
}

// Sample categories
db.prepare('INSERT INTO categories (name) VALUES (?)').run('Main Course');
db.prepare('INSERT INTO categories (name) VALUES (?)').run('Drinks');
db.prepare('INSERT INTO categories (name) VALUES (?)').run('Goods');

// Sample menu items (menu, goods, free)
db.prepare('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)').run('Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 16.99, 1, 'menu', 1);
db.prepare('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)').run('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 12.99, 1, 'menu', 1);
db.prepare('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)').run('T-shirt', 'Restaurant branded T-shirt', 9.99, 3, 'goods', 1);
db.prepare('INSERT INTO menu_items (name, description, price, category_id, type, is_available) VALUES (?, ?, ?, ?, ?, ?)').run('Free Cookie', 'Gift cookie for special customers', 0.00, 1, 'free', 1);

// Sample set menu with actual menu items and quantities
db.prepare('INSERT INTO set_menus (name, description, price, is_available) VALUES (?, ?, ?, ?)').run('Lunch Set', 'Burger + Salad + Drink', 25.99, 1);
const setMenuId = db.prepare('SELECT id FROM set_menus WHERE name = ?').get('Lunch Set').id;
const burgerId = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Beef Burger').id;
const saladId = db.prepare('SELECT id FROM menu_items WHERE name = ?').get('Caesar Salad').id;
db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, burgerId, 1);
db.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)').run(setMenuId, saladId, 1);

// Insert sample staff account
const bcrypt = require('bcryptjs');
const staffPassword = bcrypt.hashSync('staff123', 10);
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  .run('staff@homie.kitchen', staffPassword, 'Staff', 'staff');

// Insert sample customer accounts
const customerPassword = bcrypt.hashSync('customer123', 10);
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  .run('john@homie.kitchen', customerPassword, 'John Customer', 'customer');
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  .run('sarah@homie.kitchen', customerPassword, 'Sarah Customer', 'customer');
db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  .run('mike@homie.kitchen', customerPassword, 'Mike Customer', 'customer');

console.log('Database initialized with sample data!');
db.close(); 