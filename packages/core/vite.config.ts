// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-extraneous-dependencies
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    lib: {
      entry: 'src/hello-web-components.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
});
