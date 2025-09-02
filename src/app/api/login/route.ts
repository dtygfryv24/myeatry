import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save the login attempt
    const loginId = await database.saveLoginAttempt(
      email,
      password,
      rememberMe || false,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Login attempt recorded',
      loginId: loginId,
      // For academic demo purposes - in real app, you'd verify credentials
      demo_note: 'This is a demo - login attempt has been recorded for academic purposes'
    });

  } catch (error) {
    console.error('Error saving login attempt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
