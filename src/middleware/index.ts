import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from '../lib/auth/session';
import { getUserSession } from '../lib/db/queries/auth';
import type { SessionData } from '../lib/types';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals } = context;
  const { pathname } = url;
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/pricing', '/api/auth/signin', '/api/auth/signup'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/_');
  
  // Obtener token de sesión
  const sessionCookie = cookies.get('session');
  
  // Inicializar contexto local
  locals.user = null;
  locals.isAuthenticated = false;
  locals.sessionData = null;
  
  if (sessionCookie?.value) {
    try {
      // Verificar y decodificar token
      const sessionData = await verifyToken(sessionCookie.value);
      
      // Verificar si la sesión no ha expirado
      if (new Date(sessionData.expires) > new Date()) {
        // Obtener datos actualizados del usuario
        const user = await getUserSession(sessionData.user.id);
        
        if (user && user.isActive) {
          locals.user = user;
          locals.isAuthenticated = true;
          locals.sessionData = sessionData;
        }
      } else {
        // Token expirado, limpiar cookie
        cookies.delete('session', { path: '/' });
      }
    } catch (error) {
      // Token inválido, limpiar cookie
      cookies.delete('session', { path: '/' });
    }
  }
  
  // Proteger rutas del dashboard
  if (pathname.startsWith('/dashboard') && !locals.isAuthenticated) {
    const redirectUrl = new URL('/auth/signin', url);
    redirectUrl.searchParams.set('redirect', pathname);
    return Response.redirect(redirectUrl.toString());
  }
  
  // Redireccionar usuarios autenticados desde páginas de auth
  if ((pathname === '/auth/signin' || pathname === '/auth/signup') && locals.isAuthenticated) {
    return Response.redirect(new URL('/dashboard', url).toString());
  }
  
  return next();
});