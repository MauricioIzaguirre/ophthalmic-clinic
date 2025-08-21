import { type User, UserRole, type Permission } from './index';

export interface AuthUser extends Omit<User, 'passwordHash'> {
  clinics?: Array<{
    id: number;
    name: string;
    role: UserRole;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends LoginCredentials {
  name: string;
  role?: UserRole;
  clinicId?: number;
  inviteToken?: string;
}

export interface SessionContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  currentClinic?: {
    id: number;
    name: string;
    role: UserRole;
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    { resource: '*', action: 'manage', scope: 'all' }
  ],
  [UserRole.CLINIC_ADMIN]: [
    { resource: 'clinic', action: 'manage', scope: 'clinic' },
    { resource: 'locations', action: 'manage', scope: 'clinic' },
    { resource: 'doctors', action: 'manage', scope: 'clinic' },
    { resource: 'services', action: 'manage', scope: 'clinic' },
    { resource: 'appointments', action: 'read', scope: 'clinic' },
    { resource: 'credits', action: 'manage', scope: 'clinic' },
    { resource: 'reports', action: 'read', scope: 'clinic' }
  ],
  [UserRole.DOCTOR]: [
    { resource: 'appointments', action: 'read', scope: 'own' },
    { resource: 'appointments', action: 'update', scope: 'own' },
    { resource: 'schedule', action: 'read', scope: 'own' },
    { resource: 'patients', action: 'read', scope: 'own' }
  ],
  [UserRole.RECEPTIONIST]: [
    { resource: 'appointments', action: 'create', scope: 'clinic' },
    { resource: 'appointments', action: 'read', scope: 'clinic' },
    { resource: 'appointments', action: 'update', scope: 'clinic' },
    { resource: 'patients', action: 'create', scope: 'clinic' },
    { resource: 'patients', action: 'read', scope: 'clinic' },
    { resource: 'schedule', action: 'read', scope: 'clinic' }
  ],
  [UserRole.PATIENT]: [
    { resource: 'appointments', action: 'create', scope: 'own' },
    { resource: 'appointments', action: 'read', scope: 'own' },
    { resource: 'profile', action: 'update', scope: 'own' }
  ]
};