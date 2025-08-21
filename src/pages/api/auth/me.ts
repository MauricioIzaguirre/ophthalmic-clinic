import type { APIRoute } from 'astro';
import { requireAuth } from '../../../middleware/rbac';

export const GET: APIRoute = async (context) => {
  try {
    const user = requireAuth(context);
    
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          clinics: user.clinics || []
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};