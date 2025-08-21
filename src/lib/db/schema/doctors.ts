import { pgTable, serial, varchar, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { clinics } from './clinics';
import { timestamps } from './base';

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  specialization: varchar('specialization', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').default(true),
  ...timestamps
});

export const doctorsRelations = relations(doctors, ({ one }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id]
  }),
  clinic: one(clinics, {
    fields: [doctors.clinicId],
    references: [clinics.id]
  })
}));