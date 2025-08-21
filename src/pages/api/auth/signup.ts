import type { APIRoute } from 'astro';
import { z } from 'zod';
import { registerUser } from '../../../lib/db/queries/auth';
import { signToken, createSessionData } from '../../../lib/auth/session';
import { UserRole } from '../../../lib/types';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.PATIENT),
  clinicId: z.number().optional(),
  inviteToken: z.string().optional()
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    // TODO: Verificar token de invitación si se proporciona
    if (validatedData.inviteToken) {
      // Lógica para validar token de invitación
      // y determinar clinicId y role apropiados
    }

    // Registrar usuario
    const user = await registerUser(validatedData);
    
    // Crear sesión automáticamente después del registro
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
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          issues: error.issues // Corregido: error.issues en lugar de error.errors
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Manejar error de email duplicado
    if (error instanceof Error && error.message === 'Email already registered') {
      return new Response(
        JSON.stringify({ 
          error: 'Email already registered',
          field: 'email'
        }),
        { 
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.error('Sign up error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
      headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};