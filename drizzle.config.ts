// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import { defineConfig } from 'astro/config';

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;