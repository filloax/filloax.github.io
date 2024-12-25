import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';
import remarkToc from 'remark-toc';
import remarkRawFrontmatter from './plugins/remark-raw-frontmatter.mjs';

import analogjsangular from '@analogjs/astro-angular';

// https://astro.build/config
export default defineConfig({
  site: 'https://filloax.github.io',
  base: '/',
  integrations: [mdx(), svelte(), analogjsangular({
    vite: {
      inlineStylesExtension: 'scss|sass|less',
    },
  })],
  vite: {
    ssr: {
      // transform these packages during SSR. Globs supported
      noExternal: ['@rx-angular/**'],
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'nord'
    },
    remarkPlugins: [
      remarkGfm, 
      remarkSmartypants, 
      [remarkToc, {
        heading: 'contents',
      }],
      remarkRawFrontmatter,
    ],
    rehypePlugins: [[rehypeExternalLinks, {
      target: '_blank'
    }]]
  }
});