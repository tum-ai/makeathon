import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-config-prettier";
import a11y from "eslint-plugin-jsx-a11y";
import hooks from "eslint-plugin-react-hooks";
import sort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": hooks,
      "jsx-a11y": a11y,
      "simple-import-sort": sort,
      "@next/next": next,
    },
    rules: {
      ...hooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // The solar model and the weekend builder run on the server only: the
    // client receives compact samples, never the astronomy code.
    files: ["src/**/*.tsx"],
    ignores: ["src/app/**", "**/*.test.*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/solar", "@/lib/weekend"],
              message: "Build the weekend view on the server and pass it as props.",
            },
          ],
        },
      ],
    },
  },
  prettier,
);
