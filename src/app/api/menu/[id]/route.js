import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    // Check if this is a partial update (only availability)
    if (Object.keys(updateData).length === 1 && 'is_available' in updateData) {
      const updateMenuItem = await dbAdapter.prepare(`
        UPDATE menu_items 
        SET is_available = ?
        WHERE id = ?
      `);
      
      const result = await updateMenuItem.run(updateData.is_available ? true : false, id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Menu item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Menu item availability updated successfully' });
    }

    // Full update requires all fields
    const { name, description, price, category_id, image_url, is_available } = updateData;

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category are required for full updates' },
        { status: 400 }
      );
    }

    const updateMenuItem = await dbAdapter.prepare(`
      UPDATE menu_items 
      SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, is_available = ?
      WHERE id = ?
    `);
    
    const result = await updateMenuItem.run(name, description, price, category_id, image_url || null, is_available ? true : false, id);

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
    const deleteMenuItem = await dbAdapter.prepare('DELETE FROM menu_items WHERE id = ?');
    const result = await deleteMenuItem.run(id);

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