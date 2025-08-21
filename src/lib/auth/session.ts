import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { SessionData } from '../types';

const key = new TextEncoder().encode(import.meta.env.AUTH_SECRET);
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainTextPassword, hashedPassword);
}

export async function signToken(payload: SessionData): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7 days')
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionData> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function createSessionData(user: {
  id: number;
  email: string;
  role: string;
}): SessionData {
  const expiresInSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role as any
    },
    expires: expiresInSevenDays.toISOString(),
  };
}