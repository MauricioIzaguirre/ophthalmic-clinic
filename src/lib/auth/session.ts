import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { SessionData } from '../types';
import type { UserRole } from '../types';

const key = new TextEncoder().encode(import.meta.env.AUTH_SECRET);
const SALT_ROUNDS = 12;

// Interfaz que extiende JWTPayload para compatibilidad
interface JWTSessionPayload extends JWTPayload {
  user: {
    id: number;
    email: string;
    role: string; // Mantener como string en JWT
  };
  expires: string;
}

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
  // Convertir SessionData a JWTSessionPayload
  const jwtPayload: JWTSessionPayload = {
    user: payload.user,
    expires: payload.expires
  };

  return await new SignJWT(jwtPayload)
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

    // Verificar que el payload tiene la estructura esperada
    const jwtPayload = payload as JWTSessionPayload;
    
    if (!jwtPayload.user || !jwtPayload.expires) {
      throw new Error('Invalid token payload structure');
    }

    // Convertir de vuelta a SessionData
    const sessionData: SessionData = {
      user: {
        id: jwtPayload.user.id,
        email: jwtPayload.user.email,
        role: jwtPayload.user.role as UserRole // Cast seguro a UserRole
      },
      expires: jwtPayload.expires
    };

    return sessionData;
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
      role: user.role as UserRole // Cast seguro a UserRole
    },
    expires: expiresInSevenDays.toISOString(),
  };
}