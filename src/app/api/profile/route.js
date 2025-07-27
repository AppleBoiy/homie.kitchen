import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, name, currentPassword, newPassword } = await request.json();
    
    if (!userId || !name) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id, password FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If password change is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
      }

      const isPasswordValid = bcrypt.compareSync(currentPassword, existingUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password and update
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET name = ?, password = ? WHERE id = ?')
        .run(name, hashedPassword, userId);
    } else {
      // Update name only
      db.prepare('UPDATE users SET name = ? WHERE id = ?')
        .run(name, userId);
    }
    
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 