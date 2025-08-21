import { pgTable, serial, varchar, text, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { timestamps } from './base';
import { locations } from './locations';
import { doctors } from './doctors';

export const clinics = pgTable('clinics', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  creditsBalance: integer('credits_balance').default(0),
  stripeCustomerId: text('stripe_customer_id').unique(),
  isActive: boolean('is_active').default(true),
  ...timestamps
});

export const clinicMembers = pgTable('clinic_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  joinedAt: timestamps.createdAt
});

export const clinicsRelations = relations(clinics, ({ many }) => ({
  members: many(clinicMembers),
  locations: many(locations),
  doctors: many(doctors)
}));

export const clinicMembersRelations = relations(clinicMembers, ({ one }) => ({
  user: one(users, {
    fields: [clinicMembers.userId],
    references: [users.id]
  }),
  clinic: one(clinics, {
    fields: [clinicMembers.clinicId],
    references: [clinics.id]
  })
}));
