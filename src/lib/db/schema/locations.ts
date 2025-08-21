import { pgTable, serial, varchar, text, integer, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { clinics } from './clinics';
import { timestamps } from './base';

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 20 }),
  city: varchar('city', { length: 50 }).notNull(),
  workingHours: json('working_hours').$type<{
    morning?: { start: string; end: string };
    afternoon?: { start: string; end: string };
  }>(),
  isActive: boolean('is_active').default(true),
  ...timestamps
});

export const locationsRelations = relations(locations, ({ one }) => ({
  clinic: one(clinics, {
    fields: [locations.clinicId],
    references: [clinics.id]
  })
}));