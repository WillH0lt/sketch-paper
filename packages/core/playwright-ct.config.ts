// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, devices } from '@sand4rt/experimental-ct-web';
// eslint-disable-next-line import/no-extraneous-dependencies
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  // Glob patterns or regular expressions that match test files.
  testMatch: 'src/**/*.e2e.ts',
  use: {
    ctViteConfig: {
      plugins: [glsl()],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
