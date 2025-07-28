import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Database adapter that supports both SQLite (local) and Postgres (production)
class DatabaseAdapter {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.db = null;
    this.initialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (this.isProduction) {
        // Use Vercel Postgres in production
        const { sql } = await import('@vercel/postgres');
        this.db = sql;
      } else {
        // Use SQLite in development
        this.db = await open({
          filename: 'restaurant.db',
          driver: sqlite3.Database
        });
      }
      this.initialized = true;
    })();

    return this.initPromise;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.init();
    }
  }

  async exec(sql) {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      await this.db.query(sql);
    } else {
      await this.db.exec(sql);
    }
  }

  async prepare(sql) {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      return {
        run: async (...params) => {
          if (Array.isArray(params)) {
            await this.db.query(sql, params);
          } else {
            await this.db.query(sql, Object.values(params || {}));
          }
        },
        get: async (...params) => {
          if (Array.isArray(params)) {
            const result = await this.db.query(sql, params);
            return result.rows[0];
          } else {
            const result = await this.db.query(sql, Object.values(params || {}));
            return result.rows[0];
          }
        },
        all: async (...params) => {
          if (Array.isArray(params)) {
            const result = await this.db.query(sql, params);
            return result.rows;
          } else {
            const result = await this.db.query(sql, Object.values(params || {}));
            return result.rows;
          }
        }
      };
    } else {
      return this.db.prepare(sql);
    }
  }

  async query(sql, params = []) {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      const result = await this.db.query(sql, params);
      return result.rows;
    } else {
      return this.db.all(sql, params);
    }
  }
}

const dbAdapter = new DatabaseAdapter();

// Initialize database tables
const initDatabase = async () => {
  // Users table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Ingredients table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      stock_quantity INTEGER DEFAULT 0,
      unit TEXT NOT NULL,
      min_stock_level INTEGER DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      category_id INTEGER,
      image_url TEXT,
      is_available BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // Orders table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users (id)
    )
  `);

  // Order items table
  await dbAdapter.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      note TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
    )
  `);

  // Add note column if it doesn't exist (for migrations)
  try {
    await dbAdapter.exec('ALTER TABLE order_items ADD COLUMN note TEXT');
  } catch (e) {
    // Ignore error if column already exists
  }

  // Add created_at column to users table if it doesn't exist (for migrations)
  try {
    await dbAdapter.exec('ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  } catch (e) {
    // Ignore error if column already exists
  }

  // Update existing users who don't have created_at to have a default value
  try {
    await dbAdapter.exec('UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL');
  } catch (e) {
    // Ignore error if column doesn't exist yet
  }

  // Insert default categories
  const checkCategory = await dbAdapter.prepare('SELECT id FROM categories WHERE name = ?');
  const insertCategory = await dbAdapter.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  
  const categories = [
    ['Appetizers', 'Start your meal with our delicious appetizers'],
    ['Main Course', 'Our signature main dishes'],
    ['Desserts', 'Sweet endings to your meal'],
    ['Beverages', 'Refreshing drinks and beverages']
  ];
  
  for (const [name, description] of categories) {
    const existing = await checkCategory.get(name);
    if (!existing) {
      await insertCategory.run(name, description);
    }
  }

  // Insert default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const insertUser = await dbAdapter.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING');
  await insertUser.run('admin@homie.kitchen', hashedPassword, 'Admin User', 'admin');

  // Insert default staff user
  const staffPassword = bcrypt.hashSync('staff123', 10);
  await insertUser.run('staff@homie.kitchen', staffPassword, 'Staff User', 'staff');

  // Insert sample ingredients
  const checkIngredient = await dbAdapter.prepare('SELECT id FROM ingredients WHERE name = ?');
  const insertIngredient = await dbAdapter.prepare(`
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
  
  for (const [name, description, stock_quantity, unit, min_stock_level] of ingredients) {
    const existing = await checkIngredient.get(name);
    if (!existing) {
      await insertIngredient.run(name, description, stock_quantity, unit, min_stock_level);
    }
  }

  // Insert sample menu items with proper web URLs
  const checkMenuItem = await dbAdapter.prepare('SELECT id FROM menu_items WHERE name = ?');
  const insertMenuItem = await dbAdapter.prepare(`
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
  
  for (const [name, description, price, category_id, image_url] of menuItems) {
    const existing = await checkMenuItem.get(name);
    if (!existing) {
      await insertMenuItem.run(name, description, price, category_id, image_url);
    }
  }

  // Insert sample customers
  const customerPassword = bcrypt.hashSync('customer123', 10);
  const insertCustomer = await dbAdapter.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING');
  
  const customers = [
    ['john@example.com', customerPassword, 'John Smith', 'customer'],
    ['sarah@example.com', customerPassword, 'Sarah Johnson', 'customer'],
    ['mike@example.com', customerPassword, 'Mike Davis', 'customer'],
    ['emma@example.com', customerPassword, 'Emma Wilson', 'customer'],
    ['alex@example.com', customerPassword, 'Alex Brown', 'customer']
  ];
  
  for (const [email, password, name, role] of customers) {
    await insertCustomer.run(email, password, name, role);
  }

  // Insert sample orders with realistic data
  const insertOrder = await dbAdapter.prepare(`
    INSERT INTO orders (customer_id, total_amount, status, created_at) 
    VALUES (?, ?, ?, ?)
  `);
  
  const insertOrderItem = await dbAdapter.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
    VALUES (?, ?, ?, ?)
  `);

  // Get customer and menu item IDs
  const customerIds = await dbAdapter.query('SELECT id FROM users WHERE role = $1', ['customer']);
  const menuItemIds = await dbAdapter.query('SELECT id, price FROM menu_items');
  
  if (customerIds.length > 0 && menuItemIds.length > 0) {
    // Create sample orders for the last 30 days
    const now = new Date();
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)].id;
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      
      let totalAmount = 0;
      const orderItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const menuItem = menuItemIds[Math.floor(Math.random() * menuItemIds.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const itemTotal = menuItem.price * quantity;
        totalAmount += itemTotal;
        orderItems.push({ menuItemId: menuItem.id, quantity, price: menuItem.price });
      }
      
      const statuses = ['completed', 'completed', 'completed', 'ready', 'preparing', 'pending'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const order = {
        customerId,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status,
        createdAt: orderDate.toISOString(),
        items: orderItems
      };
      
      // Insert order and get the generated ID
      const orderResult = await insertOrder.run(order.customerId, order.totalAmount, order.status, order.createdAt);
      const orderId = orderResult.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id;
      
      // Insert order items
      for (const item of order.items) {
        await insertOrderItem.run(orderId, item.menuItemId, item.quantity, item.price);
      }
    }
  }
};

// Check if database is already initialized
const isInitialized = async () => {
  try {
    const userCount = await dbAdapter.query('SELECT COUNT(*) as count FROM users');
    const categoryCount = await dbAdapter.query('SELECT COUNT(*) as count FROM categories');
    return userCount[0].count > 0 && categoryCount[0].count > 0;
  } catch (error) {
    return false;
  }
};

// Initialize database only if not already initialized
const initializeDatabase = async () => {
  if (!(await isInitialized())) {
    try {
      await initDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }
};

// Initialize the database
initializeDatabase();

export default dbAdapter; 