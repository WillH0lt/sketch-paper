import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  build: {
    lib: {
      entry: 'src/sketchy-draw.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
});
