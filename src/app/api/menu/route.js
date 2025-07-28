import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';
    const type = searchParams.get('type');
    
    let query = `
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
    `;
    const conditions = [];
    if (!showAll) {
      conditions.push('mi.is_available = true');
    }
    if (type) {
      conditions.push('mi.type = ?');
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ` ORDER BY c.name, mi.name`;
    
    const stmt = await dbAdapter.prepare(query);
    const menuItems = type
      ? await stmt.all(type)
      : await stmt.all();
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
    const { name, description, price, category_id, image_url, type = 'menu', is_available = 1 } = await request.json();

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const insertMenuItem = await dbAdapter.prepare(`
      INSERT INTO menu_items (name, description, price, category_id, image_url, type, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = await insertMenuItem.run(name, description, price, category_id, image_url || null, type, is_available ? true : false);

    return NextResponse.json(
      { 
        message: 'Menu item added successfully',
        id: result.lastInsertRowid || result.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id
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