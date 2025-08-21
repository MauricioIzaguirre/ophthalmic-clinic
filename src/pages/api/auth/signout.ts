import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Limpiar cookie de sesión
  cookies.delete('session', { path: '/' });
  
  return new Response(
    JSON.stringify({ success: true }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Limpiar cookie de sesión
  cookies.delete('session', { path: '/' });
  
  // Redireccionar a página de inicio
  return redirect('/', 302);
};