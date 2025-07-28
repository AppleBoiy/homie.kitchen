import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const role = searchParams.get('role');

    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
    `;

    let params = [];

    if (role === 'customer' && customerId) {
      query += ' WHERE o.customer_id = ?';
      params.push(customerId);
    } else if (role === 'staff') {
      // Staff can see all orders but not process refunds
      // No additional WHERE clause needed
    }

    query += ' ORDER BY o.created_at DESC';

    const stmt = await dbAdapter.prepare(query);
    const orders = await stmt.all(...params);

    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const orderItemsStmt = await dbAdapter.prepare(`
        SELECT 
          oi.*, oi.note,
          mi.name as item_name,
          mi.description as item_description,
          sm.name as set_menu_name,
          sm.price as set_menu_price
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
        LEFT JOIN set_menus sm ON oi.set_menu_id = sm.id
        WHERE oi.order_id = ?
      `);
      const orderItems = await orderItemsStmt.all(order.id);

      // For set menu items, fetch the included items with quantities
      const orderItemsWithSetDetails = await Promise.all(orderItems.map(async (item) => {
        if (item.set_menu_id) {
          const setMenuItemsStmt = await dbAdapter.prepare(`
            SELECT 
              smi.quantity,
              mi.id,
              mi.name as item_name,
              mi.description as item_description,
              mi.type
            FROM set_menu_items smi
            JOIN menu_items mi ON smi.menu_item_id = mi.id
            WHERE smi.set_menu_id = ?
          `);
          const setMenuItems = await setMenuItemsStmt.all(item.set_menu_id);
          
          return {
            ...item,
            set_menu_items: setMenuItems
          };
        }
        return item;
      }));

      return {
        ...order,
        items: orderItemsWithSetDetails
      };
    }));

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { customerId, items } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and items are required' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      if (item.set_menu_id) {
        // For set menu items, use set menu price
        const setMenuStmt = await dbAdapter.prepare('SELECT price FROM set_menus WHERE id = ?');
        const setMenu = await setMenuStmt.get(item.set_menu_id);
        if (!setMenu) {
          return NextResponse.json(
            { error: `Set menu with ID ${item.set_menu_id} not found` },
            { status: 404 }
          );
        }
        totalAmount += setMenu.price * item.quantity;
      } else {
        // For regular items, use menu item price
        if (!item.menu_item_id) {
          return NextResponse.json(
            { error: 'Menu item ID is required for regular items' },
            { status: 400 }
          );
        }
        const menuItemStmt = await dbAdapter.prepare('SELECT price FROM menu_items WHERE id = ?');
        const menuItem = await menuItemStmt.get(item.menu_item_id);
        if (!menuItem) {
          return NextResponse.json(
            { error: `Menu item with ID ${item.menu_item_id} not found` },
            { status: 404 }
          );
        }
        totalAmount += menuItem.price * item.quantity;
      }
    }

    // Create order
    const insertOrder = await dbAdapter.prepare('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)');
    const orderResult = await insertOrder.run(customerId, totalAmount);
    const orderId = orderResult.lastInsertRowid || orderResult.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id;

    // Insert order items
    const insertOrderItem = await dbAdapter.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price, set_menu_id, note) VALUES (?, ?, ?, ?, ?, ?)');

    for (const item of items) {
      if (item.set_menu_id) {
        // For set menu items, store the set menu price with null menu_item_id
        const setMenuStmt = await dbAdapter.prepare('SELECT price FROM set_menus WHERE id = ?');
        const setMenu = await setMenuStmt.get(item.set_menu_id);
        await insertOrderItem.run(orderId, null, item.quantity, setMenu.price, item.set_menu_id, item.note || null);
      } else {
        // For regular items, store the menu item price
        const menuItemStmt = await dbAdapter.prepare('SELECT price FROM menu_items WHERE id = ?');
        const menuItem = await menuItemStmt.get(item.menu_item_id);
        await insertOrderItem.run(orderId, item.menu_item_id, item.quantity, menuItem.price, null, item.note || null);
      }
    }

    return NextResponse.json(
      { 
        message: 'Order created successfully',
        orderId,
        totalAmount
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 