import { NextResponse } from 'next/server';
import dbAdapter from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const stmt = await dbAdapter.prepare('SELECT id, email, name, role FROM users ORDER BY name');
    const users = await stmt.all();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();
    
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUserStmt = await dbAdapter.prepare('SELECT id FROM users WHERE email = ?');
    const existingUser = await existingUserStmt.get(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Insert new user
    const insertUser = await dbAdapter.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
    const result = await insertUser.run(email, hashedPassword, name, role);
    
    return NextResponse.json({ 
      message: 'User created successfully',
      id: result.lastInsertRowid || result.lastID || (await dbAdapter.query('SELECT LASTVAL() as id'))[0].id
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, email, password, name, role } = await request.json();
    
    if (!id || !email || !name || !role) {
      return NextResponse.json({ error: 'ID, email, name, and role are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await dbAdapter.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is already taken by another user
    const emailTaken = await dbAdapter.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
    if (emailTaken) {
      return NextResponse.json({ error: 'Email is already taken by another user' }, { status: 409 });
    }

    if (password) {
      // Update with new password
      const hashedPassword = bcrypt.hashSync(password, 10);
      await dbAdapter.prepare('UPDATE users SET email = ?, password = ?, name = ?, role = ? WHERE id = ?')
        .run(email, hashedPassword, name, role, id);
    } else {
      // Update without changing password
      await dbAdapter.prepare('UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?')
        .run(email, name, role, id);
    }
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await dbAdapter.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has any orders (for customers)
    const userOrders = await dbAdapter.prepare('SELECT COUNT(*) as count FROM orders WHERE customer_id = ?').get(id);
    if (userOrders.count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with existing orders. Consider deactivating instead.' 
      }, { status: 400 });
    }

    // Delete user
    await dbAdapter.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 