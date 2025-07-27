import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const order = db.prepare(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items
    const orderItems = db.prepare(`
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
    `).all(id);

    // For set menu items, fetch the included items with quantities
    const orderItemsWithSetDetails = orderItems.map(item => {
      if (item.set_menu_id) {
        const setMenuItems = db.prepare(`
          SELECT 
            smi.quantity,
            mi.id,
            mi.name as item_name,
            mi.description as item_description,
            mi.type
          FROM set_menu_items smi
          JOIN menu_items mi ON smi.menu_item_id = mi.id
          WHERE smi.set_menu_id = ?
        `).all(item.set_menu_id);
        
        return {
          ...item,
          set_menu_items: setMenuItems
        };
      }
      return item;
    });

    return NextResponse.json({
      ...order,
      items: orderItemsWithSetDetails
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { refund_amount, refund_reason, action } = await request.json();

    // Handle refund request (customer action)
    if (action === 'request_refund') {
      if (!refund_reason || refund_reason.trim() === '') {
        return NextResponse.json(
          { error: 'Refund reason is required' },
          { status: 400 }
        );
      }

      // Get the order
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Check if order is completed
      if (order.status !== 'completed') {
        return NextResponse.json(
          { error: 'Refund can only be requested for completed orders' },
          { status: 400 }
        );
      }

      // Check if refund is already requested or processed
      if (order.refund_status === 'requested' || order.refund_status === 'refunded') {
        return NextResponse.json(
          { error: 'Refund has already been requested or processed' },
          { status: 400 }
        );
      }

      // Request refund
      const updateOrder = db.prepare(`
        UPDATE orders 
        SET refund_status = ?, refund_reason = ?, refunded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = updateOrder.run('requested', refund_reason, id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      // Get updated order
      const updatedOrder = db.prepare(`
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = ?
      `).get(id);

      return NextResponse.json({
        message: 'Refund request submitted successfully',
        order: updatedOrder
      });
    }

    // Handle refund processing (staff action)
    if (action === 'process_refund') {
      // Validate input
      if (!refund_amount || refund_amount <= 0) {
        return NextResponse.json(
          { error: 'Valid refund amount is required' },
          { status: 400 }
        );
      }

      if (!refund_reason || refund_reason.trim() === '') {
        return NextResponse.json(
          { error: 'Refund reason is required' },
          { status: 400 }
        );
      }

      // Get the order
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Check if order is already refunded
      if (order.refund_status === 'refunded') {
        return NextResponse.json(
          { error: 'Order is already refunded' },
          { status: 400 }
        );
      }

      // Check if refund amount is valid
      if (refund_amount > order.total_amount) {
        return NextResponse.json(
          { error: 'Refund amount cannot exceed order total' },
          { status: 400 }
        );
      }

      // Process refund
      const updateOrder = db.prepare(`
        UPDATE orders 
        SET refund_status = ?, refund_amount = ?, refund_reason = ?, refunded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = updateOrder.run('refunded', refund_amount, refund_reason, id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      // Get updated order
      const updatedOrder = db.prepare(`
        SELECT 
          o.*,
          u.name as customer_name,
          u.email as customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = ?
      `).get(id);

      return NextResponse.json({
        message: 'Refund processed successfully',
        order: updatedOrder
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 