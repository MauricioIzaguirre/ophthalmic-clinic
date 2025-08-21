import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    react(),
    tailwind()
  ],
  experimental: {
    staticImportMetaEnv: true,
    chromeDevtoolsWorkspace: true
  },
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
});