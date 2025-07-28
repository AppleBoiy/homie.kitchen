import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';

export async function GET() {
  try {
    const stmt = await dbAdapter.prepare('SELECT * FROM categories ORDER BY name');
    const categories = await stmt.all();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 