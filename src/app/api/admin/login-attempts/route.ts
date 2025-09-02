import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // In a real application, you'd check authentication here
    // For academic demo, we'll add a simple check
    const authHeader = request.headers.get('authorization');
    const adminKey = 'demo-admin-key'; // In real app, use proper authentication

    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const loginAttempts = await database.getAllLoginAttempts();

    return NextResponse.json({
      success: true,
      data: loginAttempts,
      count: loginAttempts.length,
      note: 'Academic demo - passwords are securely hashed'
    });

  } catch (error) {
    console.error('Error retrieving login attempts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
