import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  optimizeDeps: {
    entries: ["./index.html"],
  },
  plugins: [tsconfigPaths(), glsl()],
});
