/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly AUTH_SECRET: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly NODE_ENV: 'development' | 'production';
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
      isActive: boolean;
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