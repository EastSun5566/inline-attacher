/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: '/inline-attacher/',
  plugins: [solid()],
});
