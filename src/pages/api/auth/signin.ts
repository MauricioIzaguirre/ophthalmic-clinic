import type { APIRoute } from 'astro';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/db/queries/auth';
import { signToken, createSessionData } from '../../../lib/auth/session';

const signInSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100)
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = signInSchema.parse(body);

    // Autenticar usuario
    const user = await authenticateUser({ email, password });
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid credentials',
          field: 'email' 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Crear sesión
    const sessionData = createSessionData(user);
    const token = await signToken(sessionData);
    
    // Configurar cookie de sesión
    cookies.set('session', token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          issues: error.errors 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.error('Sign in error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};