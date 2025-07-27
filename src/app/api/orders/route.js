import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const orderItems = db.prepare(`
        SELECT 
          oi.*,
          mi.name as item_name,
          mi.description as item_description
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
      `).all(order.id);

      return {
        ...order,
        items: orderItems
      };
    });

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
      const menuItem = db.prepare('SELECT price FROM menu_items WHERE id = ?').get(item.menu_item_id);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item with ID ${item.menu_item_id} not found` },
          { status: 404 }
        );
      }
      totalAmount += menuItem.price * item.quantity;
    }

    // Create order
    const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)');
    const orderResult = insertOrder.run(customerId, totalAmount);
    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)');

    for (const item of items) {
      const menuItem = db.prepare('SELECT price FROM menu_items WHERE id = ?').get(item.menu_item_id);
      insertOrderItem.run(orderId, item.menu_item_id, item.quantity, menuItem.price);
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