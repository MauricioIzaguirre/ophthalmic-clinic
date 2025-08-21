// Roles del sistema
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CLINIC_ADMIN = 'clinic_admin', 
  DOCTOR = 'doctor',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient'
}

// Estados base
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

// Tipos base para timestamps
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Tipo para usuarios del sistema
export interface User extends BaseEntity {
  name: string | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}

// Tipo para clínicas
export interface Clinic extends BaseEntity {
  name: string;
  description?: string | null;
  creditsBalance: number;
  stripeCustomerId?: string | null;
  isActive: boolean;
}

// Tipo para miembros de clínica
export interface ClinicMember extends BaseEntity {
  userId: number;
  clinicId: number;
  role: UserRole;
  joinedAt: Date;
}

// Tipo para ubicaciones
export interface Location extends BaseEntity {
  clinicId: number;
  name: string;
  address: string;
  phone?: string | null;
  city: string;
  workingHours: {
    morning?: {
      start: string;
      end: string;
    };
    afternoon?: {
      start: string;
      end: string;
    };
  } | null;
  isActive: boolean;
}

// Tipo para médicos
export interface Doctor extends BaseEntity {
  userId: number;
  clinicId: number;
  specialization: string;
  licenseNumber?: string | null;
  phone?: string | null;
  isActive: boolean;
}

// Permisos del sistema
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope?: 'own' | 'clinic' | 'all';
}

// Contexto de sesión
export interface SessionData {
  user: {
    id: number;
    email: string;
    role: UserRole;
  };
  expires: string;
}

// Estados de formularios
export interface ActionState {
  error?: string;
  success?: string;
  [key: string]: any;
}