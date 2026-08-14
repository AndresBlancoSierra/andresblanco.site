// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://andresblanco.site',
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
  redirects: {
    '/about': '/#about',
    '/projects': '/#projects',
    '/security': '/#security',
    '/resume': '/#resume',
    '/contact': '/#contact',
    '/writing': '/',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
