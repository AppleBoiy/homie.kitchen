import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const ingredients = db.prepare(`
      SELECT * FROM ingredients 
      ORDER BY name
    `).all();

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

    const insertIngredient = db.prepare(`
      INSERT INTO ingredients (name, description, stock_quantity, unit, min_stock_level)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insertIngredient.run(
      name, 
      description, 
      stock_quantity || 0, 
      unit, 
      min_stock_level || 10
    );

    return NextResponse.json(
      { 
        message: 'Ingredient added successfully',
        id: result.lastInsertRowid
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