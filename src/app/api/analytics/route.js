import dbAdapter from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview'; // overview, sales, items, customers, inventory

    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    switch (type) {
      case 'overview':
        return Response.json(await getOverviewData(startDateStr));
      case 'sales':
        return Response.json(await getSalesData(startDateStr, period));
      case 'items':
        return Response.json(await getItemsData(startDateStr));
      case 'customers':
        return Response.json(await getCustomersData(startDateStr));
      case 'inventory':
        return Response.json(await getInventoryData());
      default:
        return Response.json(await getOverviewData(startDateStr));
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}

// Overview data - key metrics
async function getOverviewData(startDate) {
  // Total revenue
  const revenueStmt = await dbAdapter.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders 
    WHERE DATE(created_at) >= ? AND status != 'cancelled'
  `);
  const revenue = await revenueStmt.get(startDate);

  // Total orders
  const ordersStmt = await dbAdapter.prepare(`
    SELECT COUNT(*) as total_orders
    FROM orders 
    WHERE DATE(created_at) >= ? AND status != 'cancelled'
  `);
  const orders = await ordersStmt.get(startDate);

  // Average order value
  const avgOrderStmt = await dbAdapter.prepare(`
    SELECT COALESCE(AVG(total_amount), 0) as avg_order_value
    FROM orders 
    WHERE DATE(created_at) >= ? AND status != 'cancelled'
  `);
  const avgOrder = await avgOrderStmt.get(startDate);

  // Active customers
  const customersStmt = await dbAdapter.prepare(`
    SELECT COUNT(DISTINCT customer_id) as active_customers
    FROM orders 
    WHERE DATE(created_at) >= ? AND status != 'cancelled'
  `);
  const customers = await customersStmt.get(startDate);

  // Low stock items
  const lowStockStmt = await dbAdapter.prepare(`
    SELECT COUNT(*) as low_stock_items
    FROM ingredients 
    WHERE stock_quantity <= min_stock_level
  `);
  const lowStock = await lowStockStmt.get();

  // Pending orders
  const pendingStmt = await dbAdapter.prepare(`
    SELECT COUNT(*) as pending_orders
    FROM orders 
    WHERE status IN ('pending', 'preparing')
  `);
  const pending = await pendingStmt.get();

  return {
    revenue: revenue.total_revenue,
    orders: orders.total_orders,
    avgOrderValue: avgOrder.avg_order_value,
    activeCustomers: customers.active_customers,
    lowStockItems: lowStock.low_stock_items,
    pendingOrders: pending.pending_orders
  };
}

// Sales data with time series
async function getSalesData(startDate, period) {
  let groupBy;
  let dateFormat;
  
  switch (period) {
    case '7d':
      groupBy = 'DATE(created_at)';
      dateFormat = '%Y-%m-%d';
      break;
    case '30d':
      groupBy = 'DATE(created_at)';
      dateFormat = '%Y-%m-%d';
      break;
    case '90d':
      groupBy = 'DATE(created_at, "weekday 0", "-6 days")';
      dateFormat = '%Y-%m-%d';
      break;
    case '1y':
      groupBy = 'strftime("%Y-%m", created_at)';
      dateFormat = '%Y-%m';
      break;
    default:
      groupBy = 'DATE(created_at)';
      dateFormat = '%Y-%m-%d';
  }

  const salesStmt = await dbAdapter.prepare(`
    SELECT 
      ${groupBy} as date,
      COUNT(*) as orders,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders 
    WHERE DATE(created_at) >= ? AND status != 'cancelled'
    GROUP BY ${groupBy}
    ORDER BY date
  `);
  
  const sales = await salesStmt.all(startDate);

  // Status distribution
  const statusStmt = await dbAdapter.prepare(`
    SELECT 
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM orders 
    WHERE DATE(created_at) >= ?
    GROUP BY status
  `);
  
  const statusDistribution = await statusStmt.all(startDate);

  return {
    timeSeries: sales,
    statusDistribution
  };
}

// Popular items analysis
async function getItemsData(startDate) {
  // Most popular individual items
  const popularStmt = await dbAdapter.prepare(`
    SELECT 
      mi.name,
      mi.price,
      c.name as category,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
      'item' as type
    FROM menu_items mi
    LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN categories c ON mi.category_id = c.id
    WHERE (o.created_at IS NULL OR DATE(o.created_at) >= ?) 
      AND (o.status IS NULL OR o.status != 'cancelled')
      AND oi.set_menu_id IS NULL
    GROUP BY mi.id, mi.name, mi.price, c.name
    ORDER BY total_quantity DESC
    LIMIT 10
  `);
  
  const popularItems = await popularStmt.all(startDate);

  // Most popular set menus
  const popularSetMenusStmt = await dbAdapter.prepare(`
    SELECT 
      sm.name,
      sm.price,
      'Set Menu' as category,
      COUNT(DISTINCT o.id) as order_count,
      SUM(oi.quantity) as total_quantity,
      COALESCE(SUM(oi.quantity * sm.price), 0) as total_revenue,
      'set_menu' as type
    FROM set_menus sm
    LEFT JOIN order_items oi ON oi.set_menu_id = sm.id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE (o.created_at IS NULL OR DATE(o.created_at) >= ?) 
      AND (o.status IS NULL OR o.status != 'cancelled')
    GROUP BY sm.id, sm.name, sm.price
    ORDER BY total_quantity DESC
    LIMIT 10
  `);
  
  const popularSetMenus = await popularSetMenusStmt.all(startDate);

  // Combine and sort by total quantity
  const allPopularItems = [...popularItems, ...popularSetMenus]
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 10);

  // Category performance (including set menus)
  const categoryStmt = await dbAdapter.prepare(`
    SELECT 
      c.name as category,
      COUNT(DISTINCT o.id) as orders,
      COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
    FROM categories c
    LEFT JOIN menu_items mi ON c.id = mi.category_id
    LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE (o.created_at IS NULL OR DATE(o.created_at) >= ?) 
      AND (o.status IS NULL OR o.status != 'cancelled')
      AND oi.set_menu_id IS NULL
    GROUP BY c.id, c.name
    
    UNION ALL
    
    SELECT 
      'Set Menu' as category,
      COUNT(DISTINCT o.id) as orders,
      COALESCE(SUM(oi.quantity * sm.price), 0) as revenue
    FROM set_menus sm
    LEFT JOIN order_items oi ON oi.set_menu_id = sm.id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE (o.created_at IS NULL OR DATE(o.created_at) >= ?) 
      AND (o.status IS NULL OR o.status != 'cancelled')
  `);
  
  const categoryPerformance = await categoryStmt.all(startDate, startDate);

  return {
    popularItems: allPopularItems,
    categoryPerformance
  };
}

// Customer analytics
async function getCustomersData(startDate) {
  // Top customers
  const topCustomersStmt = await dbAdapter.prepare(`
    SELECT 
      u.name,
      u.email,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_spent,
      COALESCE(AVG(o.total_amount), 0) as avg_order_value,
      MAX(o.created_at) as last_order
    FROM users u
    INNER JOIN orders o ON u.id = o.customer_id
    WHERE u.role = 'customer'
      AND DATE(o.created_at) >= ?
      AND o.status != 'cancelled'
    GROUP BY u.id, u.name, u.email
    ORDER BY total_spent DESC
    LIMIT 10
  `);
  
  const topCustomers = await topCustomersStmt.all(startDate);

  // Customer acquisition over time (simplified since users table doesn't have created_at)
  // For now, we'll use a placeholder since we can't track when customers were created
  const customerAcquisition = [];

  return {
    topCustomers,
    customerAcquisition
  };
}

// Inventory insights
async function getInventoryData() {
  // Low stock items
  const lowStockStmt = await dbAdapter.prepare(`
    SELECT 
      name,
      description,
      stock_quantity,
      unit,
      min_stock_level,
      ROUND((stock_quantity * 100.0 / min_stock_level), 2) as stock_percentage
    FROM ingredients 
    WHERE stock_quantity <= min_stock_level
    ORDER BY stock_percentage ASC
  `);
  
  const lowStockItems = await lowStockStmt.all();

  // Stock value
  const stockValueStmt = await dbAdapter.prepare(`
    SELECT 
      COUNT(*) as total_items,
      SUM(stock_quantity) as total_quantity,
      COUNT(CASE WHEN stock_quantity <= min_stock_level THEN 1 END) as low_stock_count
    FROM ingredients
  `);
  
  const stockValue = await stockValueStmt.get();

  // Stock turnover (simplified - would need purchase history for accurate calculation)
  const turnoverStmt = await dbAdapter.prepare(`
    SELECT 
      i.name,
      i.stock_quantity,
      COALESCE(SUM(oi.quantity), 0) as sold_quantity
    FROM ingredients i
    LEFT JOIN order_items oi ON i.id = oi.menu_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE (o.created_at IS NULL OR DATE(o.created_at) >= DATE('now', '-30 days'))
      AND (o.status IS NULL OR o.status != 'cancelled')
    GROUP BY i.id, i.name, i.stock_quantity
    ORDER BY sold_quantity DESC
    LIMIT 10
  `);
  
  const stockTurnover = await turnoverStmt.all();

  return {
    lowStockItems,
    stockValue,
    stockTurnover
  };
} 