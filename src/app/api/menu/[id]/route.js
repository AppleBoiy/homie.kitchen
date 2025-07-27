import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, description, price, category_id, image_url, is_available } = await request.json();

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const updateMenuItem = db.prepare(`
      UPDATE menu_items 
      SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?
      WHERE id = ?
    `);
    
    const result = updateMenuItem.run(name, description, price, category_id, image_url || null, is_available ? 1 : 0, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Delete the menu item (relationships will be handled separately if needed)
    const deleteMenuItem = db.prepare('DELETE FROM menu_items WHERE id = ?');
    const result = deleteMenuItem.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 