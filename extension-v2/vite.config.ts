import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    crx({ manifest }),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
});
