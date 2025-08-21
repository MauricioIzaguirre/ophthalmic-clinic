// Exportar todos los esquemas y relaciones
export * from './base';
export * from './users';
export * from './clinics';
export * from './locations';
export * from './doctors';

// Re-exportar tipos inferidos
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, clinics, clinicMembers, locations, doctors } from '.';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Clinic = InferSelectModel<typeof clinics>;
export type NewClinic = InferInsertModel<typeof clinics>;
export type ClinicMember = InferSelectModel<typeof clinicMembers>;
export type NewClinicMember = InferInsertModel<typeof clinicMembers>;
export type Location = InferSelectModel<typeof locations>;
export type NewLocation = InferInsertModel<typeof locations>;
export type Doctor = InferSelectModel<typeof doctors>;
export type NewDoctor = InferInsertModel<typeof doctors>;