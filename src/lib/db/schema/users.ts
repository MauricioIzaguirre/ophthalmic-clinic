import { pgTable, serial, varchar, text, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps } from './base';
import { clinicMembers } from './clinics';
import { doctors } from './doctors';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('patient'),
  isActive: boolean('is_active').default(true),
  ...timestamps
});

export const usersRelations = relations(users, ({ many }) => ({
  clinicMembers: many(clinicMembers),
  doctors: many(doctors)
}));
