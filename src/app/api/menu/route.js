import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const menuItems = db.prepare(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.is_available = 1
      ORDER BY c.name, mi.name
    `).all();

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, description, price, category_id, image_url } = await request.json();

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const insertMenuItem = db.prepare(`
      INSERT INTO menu_items (name, description, price, category_id, image_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertMenuItem.run(name, description, price, category_id, image_url || null);

    return NextResponse.json(
      { 
        message: 'Menu item added successfully',
        id: result.lastInsertRowid
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 