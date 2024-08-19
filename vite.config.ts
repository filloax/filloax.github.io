/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      content: {
        highlighter: 'shiki',
      },
      prerender: {
        routes: [
          '/blog', '/blog/2022-12-27-my-first-post',
          '/home', 
          '/tools',
          '/',
        ],
      },
      vite: {
        inlineStylesExtension: 'scss',
      },
      ssr: true,
    }),
  ],
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
