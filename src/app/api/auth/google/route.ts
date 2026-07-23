import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface GoogleTokenInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: string | boolean;
  aud?: string;
}

/**
 * Helper to verify Google ID token via Google TokenInfo service
 */
async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo | null> {
  try {
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) return null;

    const data: GoogleTokenInfo = await googleRes.json();

    if (!data.email || !data.sub) {
      return null;
    }

    // Verify audience (Client ID) if environment variable is set
    const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (expectedClientId && data.aud !== expectedClientId) {
      console.error('Google token verification failed: Client ID (aud) mismatch.');
      return null;
    }

    // Verify email_verified status
    if (data.email_verified !== true && data.email_verified !== 'true') {
      console.error('Google token verification failed: Email is not verified.');
      return null;
    }

    return {
      sub: data.sub,
      email: data.email,
      name: data.name || data.email.split('@')[0],
      picture: data.picture,
      email_verified: data.email_verified,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google authentication credential is required.' },
        { status: 400 }
      );
    }

    const googleProfile = await verifyGoogleIdToken(credential);

    if (!googleProfile || !googleProfile.email) {
      return NextResponse.json(
        { error: 'Invalid or expired Google authentication token.' },
        { status: 400 }
      );
    }

    const normalizedEmail = googleProfile.email.toLowerCase().trim();

    // Check if user already exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleProfile.sub },
          { email: normalizedEmail },
        ],
      },
    });

    if (user) {
      // Update existing user with googleId or avatar if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleProfile.sub,
          avatarUrl: user.avatarUrl || googleProfile.picture,
          name: user.name || googleProfile.name || 'Google User',
        },
      });
    } else {
      // Create new User & Primary Portfolio
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: googleProfile.name || normalizedEmail.split('@')[0],
          googleId: googleProfile.sub,
          avatarUrl: googleProfile.picture,
          currency: 'INR',
          portfolios: {
            create: {
              name: 'Primary Investment Portfolio',
              description: 'Main portfolio created via Google SSO',
            },
          },
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatarUrl: user.avatarUrl,
      },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Google SSO API error:', error);
    return NextResponse.json({ error: 'Internal server error during Google SSO.' }, { status: 500 });
  }
}
