// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  server: {
    port: 3005,
    host: '0.0.0.0',
  },

  vite: {
    // @ts-expect-error - @tailwindcss/vite is typed against root Vite; Astro uses its bundled Vite (different Plugin types)
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  }
});