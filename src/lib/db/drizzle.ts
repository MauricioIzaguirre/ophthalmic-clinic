import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!import.meta.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Configuración para desarrollo/producción
const connectionString = import.meta.env.DATABASE_URL;

// Cliente de PostgreSQL
export const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Instancia de Drizzle
export const db = drizzle(client, { 
  schema,
  logger: import.meta.env.NODE_ENV === 'development'
});

export type Database = typeof db;