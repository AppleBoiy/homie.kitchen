import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbAdapter from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserStmt = await dbAdapter.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = await existingUserStmt.get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    const insertUser = await dbAdapter.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    );
    const result = await insertUser.run(email, hashedPassword, name, 'customer');

    // Get the inserted user ID
    const userId = result.lastInsertRowid || result.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id;
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: { id: userId, email, name, role: 'customer' }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 