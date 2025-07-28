import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function GET() {
  try {
    const stmt = await dbAdapter.prepare(`
      SELECT * FROM ingredients 
      ORDER BY name
    `);
    const ingredients = await stmt.all();

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: POST (create) is admin-only, staff cannot create new ingredients

export async function POST(request) {
  try {
    const { name, description, stock_quantity, unit, min_stock_level } = await request.json();

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Name and unit are required' },
        { status: 400 }
      );
    }

    const insertIngredient = await dbAdapter.prepare(`
      INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = await insertIngredient.run(
      name, 
      description, 
      stock_quantity || 0, 
      unit, 
      min_stock_level || 10
    );

    return NextResponse.json(
      { 
        message: 'Ingredient added successfully',
        id: result.lastInsertRowid || result.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding ingredient:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 