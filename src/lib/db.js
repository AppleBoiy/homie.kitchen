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
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // Menu item ingredients (many-to-many relationship)
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_item_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE
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
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
  insertCategory.run('Appetizers', 'Start your meal with our delicious appetizers');
  insertCategory.run('Main Course', 'Our signature main dishes');
  insertCategory.run('Desserts', 'Sweet endings to your meal');
  insertCategory.run('Beverages', 'Refreshing drinks and beverages');

  // Insert default staff user
  const hashedPassword = bcrypt.hashSync('staff123', 10);
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
  insertUser.run('staff@homie.kitchen', hashedPassword, 'Staff User', 'staff');

  // Insert sample ingredients
  const insertIngredient = db.prepare(`
    INSERT OR IGNORE INTO ingredients (name, description, stock_quantity, unit, min_stock_level) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertIngredient.run('Tomatoes', 'Fresh tomatoes', 50, 'pieces', 10);
  insertIngredient.run('Bread', 'Fresh bread', 30, 'pieces', 5);
  insertIngredient.run('Salmon', 'Fresh salmon fillets', 20, 'pieces', 5);
  insertIngredient.run('Beef', 'Ground beef', 25, 'kg', 5);
  insertIngredient.run('Lettuce', 'Fresh lettuce', 15, 'pieces', 3);
  insertIngredient.run('Cheese', 'Cheddar cheese', 10, 'kg', 2);
  insertIngredient.run('Coffee Beans', 'Premium coffee beans', 20, 'kg', 5);
  insertIngredient.run('Chocolate', 'Dark chocolate', 8, 'kg', 2);

  // Insert sample menu items with proper web URLs
  const insertMenuItem = db.prepare(`
    INSERT OR IGNORE INTO menu_items (name, description, price, category_id, image_url) 
    VALUES (?, ?, ?, ?, ?)
  `);
  
  insertMenuItem.run('Bruschetta', 'Toasted bread topped with tomatoes, garlic, and herbs', 8.99, 1, 'https://images.unsplash.com/photo-1572441713131-4d09e2c54c39?w=400&h=300&fit=crop');
  insertMenuItem.run('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 12.99, 1, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop');
  insertMenuItem.run('Grilled Salmon', 'Fresh salmon grilled to perfection with seasonal vegetables', 24.99, 2, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop');
  insertMenuItem.run('Beef Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 16.99, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop');
  insertMenuItem.run('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 8.99, 3, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop');
  insertMenuItem.run('Iced Coffee', 'Cold brewed coffee with cream and sugar', 4.99, 4, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop');

  // Insert menu item ingredients relationships
  const insertMenuItemIngredient = db.prepare(`
    INSERT OR IGNORE INTO menu_item_ingredients (menu_item_id, ingredient_id, quantity) 
    VALUES (?, ?, ?)
  `);
  
  // Bruschetta ingredients
  insertMenuItemIngredient.run(1, 1, 2); // 2 tomatoes
  insertMenuItemIngredient.run(1, 2, 1); // 1 bread slice
  
  // Caesar Salad ingredients
  insertMenuItemIngredient.run(2, 5, 1); // 1 lettuce
  insertMenuItemIngredient.run(2, 6, 0.1); // 0.1kg cheese
  
  // Grilled Salmon ingredients
  insertMenuItemIngredient.run(3, 3, 1); // 1 salmon fillet
  
  // Beef Burger ingredients
  insertMenuItemIngredient.run(4, 4, 0.2); // 0.2kg beef
  insertMenuItemIngredient.run(4, 5, 0.5); // 0.5 lettuce
  insertMenuItemIngredient.run(4, 6, 0.05); // 0.05kg cheese
  insertMenuItemIngredient.run(4, 2, 1); // 1 bread slice
  
  // Chocolate Cake ingredients
  insertMenuItemIngredient.run(5, 8, 0.1); // 0.1kg chocolate
  
  // Iced Coffee ingredients
  insertMenuItemIngredient.run(6, 7, 0.02); // 0.02kg coffee beans
};

// Initialize database on first run
initDatabase();

export default db; 