/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from 'path';
import { defineConfig } from 'vite';

import { name } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: name.replace(/-(.)/g, ($1) => $1.toUpperCase()).replace(/-/g, ''),
      fileName: name,
    },
  },
});
