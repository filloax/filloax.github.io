import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';
import remarkToc from 'remark-toc';
import remarkReadingTime from './plugins/remark-reading-time.mjs';
import rehypeFootnoteTitles from './plugins/remark-gfm-footnote-title.mjs';

import analogjsangular from '@analogjs/astro-angular';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://filloax.github.io',
  base: '/',
  integrations: [mdx(), analogjsangular({
    vite: {
      inlineStylesExtension: 'scss|sass|less',
    },
  }), svelte()],
  vite: {
    ssr: {
      // transform these packages during SSR. Globs supported
      noExternal: ['@rx-angular/**'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ['legacy-js-api', 'import'],
        }
      },
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'nord'
    },
    remarkPlugins: [
      remarkGfm, 
      remarkSmartypants, 
      rehypeFootnoteTitles,
      [remarkToc, {
        heading: 'contents',
      }],
      remarkReadingTime,
    ],
    rehypePlugins: [[rehypeExternalLinks, {
      target: '_blank'
    }]]
  }
});