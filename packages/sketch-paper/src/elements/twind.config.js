import { defineConfig } from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind";

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
  theme: {
    extend: {
      colors: {
        // primary: "var(--color-primary)",
        // secondary: "var(--color-white)",
        // primary: "#A9D9AF",
        white: "#ffffff",
        black: "#000000",
        primary: "var(--primary-color)",
        toolbar: "var(--toolbar-color)",
        gray: {
          light: "var(--gray-light)",
          medium: "var(--gray-medium)",
          dark: "var(--gray-dark)",
        },
      },
      screens: {
        xs: "475px",
        ...defineConfig.screens,
      },
    },
  },
});
