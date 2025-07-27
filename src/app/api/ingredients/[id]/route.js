import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, description, stock_quantity, unit, min_stock_level } = await request.json();

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Name and unit are required' },
        { status: 400 }
      );
    }

    const updateIngredient = db.prepare(`
      UPDATE ingredients 
      SET name = ?, description = ?, stock_quantity = ?, unit = ?, min_stock_level = ?
      WHERE id = ?
    `);
    
    const result = updateIngredient.run(name, description, stock_quantity || 0, unit, min_stock_level || 10, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ingredient updated successfully' });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Delete the ingredient (relationships will be handled separately if needed)
    const deleteIngredient = db.prepare('DELETE FROM ingredients WHERE id = ?');
    const result = deleteIngredient.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 