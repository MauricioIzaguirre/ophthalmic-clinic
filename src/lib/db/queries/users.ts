import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, clinicMembers, clinics } from '../schema';
import type { User, NewUser } from '../schema';
import type { UserRole } from '../../types';

export async function getUserById(id: number): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
    
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);
    
  return result[0] || null;
}

export async function createUser(userData: NewUser): Promise<User> {
  const result = await db
    .insert(users)
    .values(userData)
    .returning();
    
  return result[0];
}

export async function getUserWithClinics(userId: number) {
  const result = await db
    .select({
      user: users,
      clinic: clinics,
      role: clinicMembers.role
    })
    .from(users)
    .leftJoin(clinicMembers, eq(users.id, clinicMembers.userId))
    .leftJoin(clinics, eq(clinicMembers.clinicId, clinics.id))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    
  if (result.length === 0) return null;
  
  const user = result[0].user;
  const clinics = result
    .filter(r => r.clinic)
    .map(r => ({
      id: r.clinic!.id,
      name: r.clinic!.name,
      role: r.role as UserRole
    }));
    
  return { ...user, clinics };
}

export async function updateUser(
  id: number, 
  updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User> {
  const result = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
    
  return result[0];
}

export async function deactivateUser(id: number): Promise<void> {
  await db
    .update(users)
    .set({ 
      isActive: false, 
      updatedAt: new Date(),
      deletedAt: new Date()
    })
    .where(eq(users.id, id));
}