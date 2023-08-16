/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { name } from './package.json';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src'),
      name: name.replace(/-(.)/g, ($1) => $1.toUpperCase()).replace(/-/g, ''),
      fileName: name,
    },
    rollupOptions: {
      external: ['@codemirror/view'],
      output: {
        globals: {
          '@codemirror/view': 'CodemirrorView',
        },
      },
    },
  },
});
