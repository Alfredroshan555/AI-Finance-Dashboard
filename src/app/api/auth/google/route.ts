import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

interface GoogleTokenInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: string | boolean;
}

/**
 * Helper to verify Google ID token via Google TokenInfo service
 */
async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo | null> {
  try {
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) return null;

    const data = await googleRes.json();
    if (data.email && data.sub) {
      return {
        sub: data.sub,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        picture: data.picture,
        email_verified: data.email_verified,
      };
    }
    return null;
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credential, mockUser } = body;

    let googleProfile: GoogleTokenInfo | null = null;

    // Handle real Google GIS Credential
    if (credential) {
      googleProfile = await verifyGoogleIdToken(credential);
    }

    // Developer Mock Mode strictly guarded for non-production environments
    const isDevEnvironment = process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_MOCK_AUTH === 'true';
    if (!googleProfile && mockUser && isDevEnvironment) {
      googleProfile = {
        sub: mockUser.sub || `demo-google-sub-${Date.now()}`,
        email: mockUser.email || 'demo.google@wealthpulse.ai',
        name: mockUser.name || 'Google Demo User',
        picture: mockUser.picture || 'https://lh3.googleusercontent.com/a/default-user',
      };
    }

    if (!googleProfile || !googleProfile.email) {
      return NextResponse.json(
        { error: 'Invalid Google authentication token or missing email.' },
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
