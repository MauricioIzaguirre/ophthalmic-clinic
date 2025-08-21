import type { Permission, UserRole } from '../types';
import { ROLE_PERMISSIONS } from '../types/auth';

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  scope?: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Super admin tiene acceso a todo
  if (userRole === 'super_admin') {
    return true;
  }
  
  return permissions.some(permission => {
    // Verificar recurso (wildcard o exacto)
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    
    // Verificar acción (manage cubre todas las acciones)
    const actionMatch = permission.action === 'manage' || permission.action === action;
    
    // Verificar scope si es necesario
    const scopeMatch = !scope || !permission.scope || permission.scope === scope;
    
    return resourceMatch && actionMatch && scopeMatch;
  });
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function canAccessResource(
  userRole: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' = 'read'
): boolean {
  return hasPermission(userRole, resource, action);
}

export function requirePermission(
  userRole: UserRole,
  resource: string,
  action: string,
  scope?: string
): void {
  if (!hasPermission(userRole, resource, action, scope)) {
    throw new Error(`Access denied: insufficient permissions for ${action} on ${resource}`);
  }
}