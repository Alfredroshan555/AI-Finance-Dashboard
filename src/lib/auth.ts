import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const globalForJwt = globalThis as unknown as { _jwtSecret?: string };
const jwtSecret = process.env.JWT_SECRET || (globalForJwt._jwtSecret ??= crypto.randomBytes(32).toString('hex'));

export function getJwtSecret(): string {
  return jwtSecret;
}

export interface AuthPayload {
  userId: string;
  email: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

function extractTokenFromRequestHeader(req: Request): string | undefined {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:token|auth_token)=([^;]+)/);
    if (match) return match[1];
  }

  return undefined;
}

export async function getAuthUser(req?: Request): Promise<AuthPayload | null> {
  try {
    let token = req ? extractTokenFromRequestHeader(req) : undefined;
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value || cookieStore.get('auth_token')?.value;
    }

    return token ? verifyToken(token) : null;
  } catch {
    return null;
  }
}

function applyAuthCookies(response: NextResponse, token: string, maxAge: number): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  };
  response.cookies.set('token', token, cookieOptions);
  response.cookies.set('auth_token', token, cookieOptions);
  return response;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  return applyAuthCookies(response, token, 60 * 60 * 24 * 7); // 7 days
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  return applyAuthCookies(response, '', 0);
}
