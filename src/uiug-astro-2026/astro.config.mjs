// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// Set site for canonical URLs, Open Graph, and sitemap. Override with SITE_URL env if needed.
const siteUrl = 'https://uiug.in';

export default defineConfig({
  site: siteUrl,
  output: 'static', // SSG only – all pages pre-rendered at build time
  integrations: [react()],
  // Prefetch when link enters viewport only (not all routes on load) to keep initial load smaller
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: false,
  },

  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost', pathname: '/**', port: '44392' },
      { protocol: 'https', hostname: 'uiug2025.s.cmshelp.dk', pathname: '/**' },
    ],
  },

  server: {
    port: 3005,
    host: '0.0.0.0',
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  }
});