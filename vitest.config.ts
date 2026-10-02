import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const alias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
  "@test": fileURLToPath(new URL("./test", import.meta.url)),
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    globals: true,
    // The kit imports `next/link` and `next/image` without extensions, which
    // Node's ESM resolver rejects; let Vite resolve the kit like Next does.
    server: { deps: { inline: [/@tum\.ai\/ui-kit/] } },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["test/setup.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/**/*.test.*", "src/app/**"],
      reporter: ["text-summary", "html"],
    },
  },
});
