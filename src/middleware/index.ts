import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from '../lib/auth/session';
import { getUserSession } from '../lib/db/queries/auth';

const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/pricing',
  '/about',
  '/contact'
];

const API_AUTH_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/signout'
];

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.includes(pathname) ||
    API_AUTH_ROUTES.includes(pathname) ||
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/public') ||
    pathname.includes('favicon') ||
    pathname.includes('.') // Archivos estáticos
  );
}

function isAuthRoute(pathname: string): boolean {
  return pathname === '/auth/signin' || pathname === '/auth/signup';
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/api/protected');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals } = context;
  const { pathname } = url;
  
  // Inicializar contexto local
  locals.user = null;
  locals.isAuthenticated = false;
  locals.sessionData = null;
  
  // Permitir rutas públicas sin verificación
  if (isPublicRoute(pathname)) {
    // Aún así, intentar obtener datos de usuario si hay sesión
    const sessionCookie = cookies.get('session');
    
    if (sessionCookie?.value) {
      try {
        const sessionData = await verifyToken(sessionCookie.value);
        
        if (new Date(sessionData.expires) > new Date()) {
          const user = await getUserSession(sessionData.user.id);
          
          if (user && user.isActive) {
            locals.user = user;
            locals.isAuthenticated = true;
            locals.sessionData = sessionData;
          }
        } else {
          // Token expirado
          cookies.delete('session', { path: '/' });
        }
      } catch (error) {
        // Token inválido
        cookies.delete('session', { path: '/' });
      }
    }
    
    // Redireccionar usuarios autenticados desde páginas de auth
    if (isAuthRoute(pathname) && locals.isAuthenticated) {
      const redirectTo = url.searchParams.get('redirect') || '/dashboard';
      return Response.redirect(new URL(redirectTo, url).toString());
    }
    
    return next();
  }
  
  // Para rutas protegidas, validar sesión
  const sessionCookie = cookies.get('session');
  
  if (!sessionCookie?.value) {
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/signin', url);
      redirectUrl.searchParams.set('redirect', pathname);
      return Response.redirect(redirectUrl.toString());
    }
    return next();
  }
  
  try {
    const sessionData = await verifyToken(sessionCookie.value);
    
    // Verificar expiración
    if (new Date(sessionData.expires) <= new Date()) {
      cookies.delete('session', { path: '/' });
      
      if (isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/auth/signin', url);
        redirectUrl.searchParams.set('redirect', pathname);
        return Response.redirect(redirectUrl.toString());
      }
      return next();
    }
    
    // Obtener datos actualizados del usuario
    const user = await getUserSession(sessionData.user.id);
    
    if (!user || !user.isActive) {
      cookies.delete('session', { path: '/' });
      
      if (isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/auth/signin', url);
        redirectUrl.searchParams.set('redirect', pathname);
        return Response.redirect(redirectUrl.toString());
      }
      return next();
    }
    
    // Usuario válido, establecer contexto
    locals.user = user;
    locals.isAuthenticated = true;
    locals.sessionData = sessionData;
    
    return next();
    
  } catch (error) {
    console.error('Session validation error:', error);
    cookies.delete('session', { path: '/' });
    
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/signin', url);
      redirectUrl.searchParams.set('redirect', pathname);
      return Response.redirect(redirectUrl.toString());
    }
    
    return next();
  }
});