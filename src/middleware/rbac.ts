import type { APIContext } from 'astro';
import { hasPermission } from '../lib/auth/permissions';
import type { UserRole } from '../lib/types';

export function requireAuth(context: APIContext) {
  if (!context.locals.isAuthenticated || !context.locals.user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  return context.locals.user;
}

export function requireRole(context: APIContext, ...allowedRoles: UserRole[]) {
  const user = requireAuth(context);
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Response('Forbidden: Insufficient privileges', { status: 403 });
  }
  
  return user;
}

export function requirePermission(
  context: APIContext, 
  resource: string, 
  action: string,
  scope?: string
) {
  const user = requireAuth(context);
  
  if (!hasPermission(user.role as UserRole, resource, action, scope)) {
    throw new Response(`Forbidden: No permission to ${action} ${resource}`, { status: 403 });
  }
  
  return user;
}

export function withAuth<T extends any[]>(
  handler: (context: APIContext, user: any, ...args: T) => Response | Promise<Response>
) {
  return (context: APIContext, ...args: T) => {
    const user = requireAuth(context);
    return handler(context, user, ...args);
  };
}

export function withRole<T extends any[]>(
  allowedRoles: UserRole[],
  handler: (context: APIContext, user: any, ...args: T) => Response | Promise<Response>
) {
  return (context: APIContext, ...args: T) => {
    const user = requireRole(context, ...allowedRoles);
    return handler(context, user, ...args);
  };
}