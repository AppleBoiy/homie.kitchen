import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('restaurant.db');

// Initialize database tables
const initDatabase = () => {
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
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Ingredients table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      stock_quantity INTEGER DEFAULT 0,
      unit TEXT NOT NULL,
      min_stock_level INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table (removed stock_quantity, added image_url)
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

  // Insert default categories
  const checkCategory = db.prepare('SELECT id FROM categories WHERE name = ?');
  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  
  const categories = [
    ['Appetizers', 'Start your meal with our delicious appetizers'],
    ['Main Course', 'Our signature main dishes'],
    ['Desserts', 'Sweet endings to your meal'],
    ['Beverages', 'Refreshing drinks and beverages']
  ];
  
  categories.forEach(([name, description]) => {
    const existing = checkCategory.get(name);
    if (!existing) {
      insertCategory.run(name, description);
    }
  });

  // Insert default staff user
  const hashedPassword = bcrypt.hashSync('staff123', 10);
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  insertUser.run('staff@homie.kitchen', hashedPassword, 'Staff User', 'staff');

  // Insert sample ingredients
  const checkIngredient = db.prepare('SELECT id FROM ingredients WHERE name = ?');
  const insertIngredient = db.prepare(`
    INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const ingredients = [
    ['Tomatoes', 'Fresh tomatoes', 50, 'pieces', 10],
    ['Bread', 'Fresh bread', 30, 'pieces', 5],
    ['Salmon', 'Fresh salmon fillets', 20, 'pieces', 5],
    ['Beef', 'Ground beef', 25, 'kg', 5],
    ['Lettuce', 'Fresh lettuce', 15, 'pieces', 3],
    ['Cheese', 'Cheddar cheese', 10, 'kg', 2],
    ['Coffee Beans', 'Premium coffee beans', 20, 'kg', 5],
    ['Chocolate', 'Dark chocolate', 8, 'kg', 2]
  ];
  
  ingredients.forEach(([name, description, stock_quantity, unit, min_stock_level]) => {
    const existing = checkIngredient.get(name);
    if (!existing) {
      insertIngredient.run(name, description, stock_quantity, unit, min_stock_level);
    }
  });

  // Insert sample menu items with proper web URLs
  const checkMenuItem = db.prepare('SELECT id FROM menu_items WHERE name = ?');
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (name, description, price, category_id, image_url) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const menuItems = [
    ['Bruschetta', 'Toasted bread topped with tomatoes, garlic, and herbs', 8.99, 1, 'https://images.unsplash.com/photo-1572441713131-4d09e2c54c39?w=400&h=300&fit=crop'],
    ['Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 12.99, 1, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop'],
    ['Grilled Salmon', 'Fresh salmon grilled to perfection with seasonal vegetables', 24.99, 2, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop'],
    ['Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 16.99, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'],
    ['Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 8.99, 3, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'],
    ['Iced Coffee', 'Cold brewed coffee with cream and sugar', 4.99, 4, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop']
  ];
  
  menuItems.forEach(([name, description, price, category_id, image_url]) => {
    const existing = checkMenuItem.get(name);
    if (!existing) {
      insertMenuItem.run(name, description, price, category_id, image_url);
    }
  });


};

// Check if database is already initialized
const isInitialized = () => {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    return userCount.count > 0 && categoryCount.count > 0;
  } catch (error) {
    return false;
  }
};

// Initialize database only if not already initialized
if (!isInitialized()) {
  try {
    initDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export default db; 