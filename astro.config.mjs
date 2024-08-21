import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeExternalLinks from 'rehype-external-links';
import angular from '@analogjs/astro-angular';
import remarkToc from 'remark-toc';

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-blog-template.netlify.app',
  integrations: [
    mdx(), 
    svelte(), 
    angular({
      vite: {
        inlineStylesExtension: 'scss|sass|less',
      },
    })
  ],
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
    ],
    rehypePlugins: [[rehypeExternalLinks, {
      target: '_blank'
    }]]
  }
});