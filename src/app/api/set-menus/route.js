import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function GET() {
  try {
    const setMenusStmt = await dbAdapter.prepare(`
      SELECT 
        sm.*
      FROM set_menus sm
    `);
    const setMenus = await setMenusStmt.all();
    
    const getSetMenuItems = await dbAdapter.prepare(`
      SELECT 
        smi.quantity,
        mi.id,
        mi.name,
        mi.description,
        mi.type
      FROM set_menu_items smi
      JOIN menu_items mi ON smi.menu_item_id = mi.id
      WHERE smi.set_menu_id = ?
    `);
    
    const result = await Promise.all(setMenus.map(async (setMenu) => ({
      ...setMenu,
      items: await getSetMenuItems.all(setMenu.id)
    })));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching set menus:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, price, is_available = true, category_id, items = [] } = await request.json();
    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }
    
    const insertSetMenu = await dbAdapter.prepare('INSERT INTO set_menus (name, description, price, is_available, category_id) VALUES (?, ?, ?, ?, ?)');
    const result = await insertSetMenu.run(name, description, price, is_available ? true : false, category_id || null);
    const setMenuId = result.lastInsertRowid || result.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id;
    
    // Insert set menu items with quantities
    if (items.length > 0) {
      const insertSetMenuItem = await dbAdapter.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)');
      for (const item of items) {
        await insertSetMenuItem.run(setMenuId, item.menu_item_id, item.quantity || 1);
      }
    }
    
    return NextResponse.json({ message: 'Set menu created', id: setMenuId }, { status: 201 });
  } catch (error) {
    console.error('Error creating set menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updateData = await request.json();
    
    // Check if this is a partial update (only availability)
    if (Object.keys(updateData).length === 2 && 'id' in updateData && 'is_available' in updateData) {
      const { id, is_available } = updateData;
      
      const result = await dbAdapter.prepare('UPDATE set_menus SET is_available = ? WHERE id = ?')
        .run(is_available ? true : false, id);
      
      if (result.changes === 0) {
        return NextResponse.json({ error: 'Set menu not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Set menu availability updated' });
    }
    
    // Full update requires all fields
    const { id, name, description, price, is_available = true, category_id, items = [] } = updateData;
    if (!id || !name || !price) {
      return NextResponse.json({ error: 'ID, name, and price are required for full updates' }, { status: 400 });
    }
    
    await dbAdapter.prepare('UPDATE set_menus SET name = ?, description = ?, price = ?, is_available = ?, category_id = ? WHERE id = ?')
      .run(name, description, price, is_available ? true : false, category_id || null, id);
    
    // Update set menu items
    await dbAdapter.prepare('DELETE FROM set_menu_items WHERE set_menu_id = ?').run(id);
    if (items.length > 0) {
      const insertSetMenuItem = await dbAdapter.prepare('INSERT INTO set_menu_items (set_menu_id, menu_item_id, quantity) VALUES (?, ?, ?)');
      for (const item of items) {
        await insertSetMenuItem.run(id, item.menu_item_id, item.quantity || 1);
      }
    }
    
    return NextResponse.json({ message: 'Set menu updated' });
  } catch (error) {
    console.error('Error updating set menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await dbAdapter.prepare('DELETE FROM set_menu_items WHERE set_menu_id = ?').run(id);
    await dbAdapter.prepare('DELETE FROM set_menus WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Set menu deleted' });
  } catch (error) {
    console.error('Error deleting set menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 