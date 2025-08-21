/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly AUTH_SECRET: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly BASE_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly PROD: boolean;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: number;
      name: string | null;
      email: string;
      role: string;
      isActive: boolean; // Ahora siempre boolean
      clinics?: Array<{
        id: number;
        name: string;
        role: string;
      }>;
    } | null;
    isAuthenticated: boolean;
    sessionData: {
      user: {
        id: number;
        email: string;
        role: string;
      };
      expires: string;
    } | null;
  }
}