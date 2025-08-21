import { eq } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, clinicMembers } from '../schema';
import { comparePasswords, hashPassword } from '../../auth/session';
import type { LoginCredentials, SignUpData } from '../../types/auth';
import type { User } from '../schema';

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  const result: User[] = await db
    .select()
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);
    
  if (result.length === 0) return null;
  
  const foundUser = result[0];
  
  // Verificar que el usuario esté activo
  if (!foundUser.isActive || foundUser.deletedAt) {
    return null;
  }
  
  // Verificar contraseña
  const isValidPassword = await comparePasswords(
    credentials.password,
    foundUser.passwordHash
  );
  
  return isValidPassword ? foundUser : null;
}

export async function registerUser(signUpData: SignUpData): Promise<User> {
  // Verificar que el email no esté en uso
  const existingUser: User[] = await db
    .select()
    .from(users)
    .where(eq(users.email, signUpData.email))
    .limit(1);
    
  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }
  
  // Hash de la contraseña
  const passwordHash = await hashPassword(signUpData.password);
  
  // Crear usuario
  const newUser: User[] = await db
    .insert(users)
    .values({
      name: signUpData.name,
      email: signUpData.email,
      passwordHash,
      role: signUpData.role || 'patient',
      isActive: true
    })
    .returning();
    
  const user = newUser[0];
  
  // Si se especifica una clínica, agregar el usuario como miembro
  if (signUpData.clinicId && signUpData.role) {
    await db
      .insert(clinicMembers)
      .values({
        userId: user.id,
        clinicId: signUpData.clinicId,
        role: signUpData.role
      });
  }
  
  return user;
}

export async function getUserSession(userId: number) {
  // Importación dinámica para evitar dependencia circular
  const { clinics } = await import('../schema');
  
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      clinicId: clinics.id,
      clinicName: clinics.name,
      memberRole: clinicMembers.role
    })
    .from(users)
    .leftJoin(clinicMembers, eq(users.id, clinicMembers.userId))
    .leftJoin(clinics, eq(clinicMembers.clinicId, clinics.id))
    .where(eq(users.id, userId));
    
  if (result.length === 0) return null;
  
  const user = {
    id: result[0].id,
    name: result[0].name,
    email: result[0].email,
    role: result[0].role,
    isActive: result[0].isActive,
    clinics: result
      .filter(r => r.clinicId)
      .map(r => ({
        id: r.clinicId!,
        name: r.clinicName!,
        role: r.memberRole!
      }))
  };
  
  return user;
}