import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminKey = 'demo-admin-key';

    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plainPassword, hashedPassword } = body;

    if (!plainPassword || !hashedPassword) {
      return NextResponse.json(
        { error: 'Plain password and hashed password are required' },
        { status: 400 }
      );
    }

    const isMatch = await database.verifyPassword(plainPassword, hashedPassword);

    return NextResponse.json({
      success: true,
      isMatch,
      message: isMatch ? 'Password matches' : 'Password does not match',
      note: 'Academic demo - password verification for educational purposes'
    });

  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
