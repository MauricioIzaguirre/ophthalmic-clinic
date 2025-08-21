// Re-exportar esquemas base y utilidades
export * from './base';

// Exportar esquemas individuales para evitar dependencias circulares
export { users, usersRelations } from './users';
export { clinics, clinicMembers, clinicsRelations, clinicMembersRelations } from './clinics';
export { locations, locationsRelations } from './locations';
export { doctors, doctorsRelations } from './doctors';

// Re-exportar tipos inferidos desde drizzle-orm
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from './users';
import { clinics, clinicMembers } from './clinics';
import { locations } from './locations';
import { doctors } from './doctors';

// Tipos base
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

// Tipos compuestos útiles
export type UserWithClinics = User & {
  clinics: Array<{
    id: number;
    name: string;
    role: string;
  }>;
};

export type ClinicWithMembers = Clinic & {
  members: Array<ClinicMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  }>;
};