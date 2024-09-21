import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import glsl from "vite-plugin-glsl";
import path from "path";

export default defineConfig({
  optimizeDeps: {
    entries: ["./index.html", "./src/sketch-paper.ts"],
  },
  plugins: [tsconfigPaths(), glsl()],
  build: {
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, "src/sketch-paper.ts"),
      fileName: "main",
      formats: ["es", "cjs"],
    },
  },
});
