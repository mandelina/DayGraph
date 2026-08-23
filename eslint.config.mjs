import tsParser from "@typescript-eslint/parser";

const sharedParser = {
  parser: tsParser,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "data/**",
      "ai-artifacts/**",
      "packages/collector/bin/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: sharedParser,
  },
  {
    files: ["apps/renderer/src/**/*.{ts,tsx}"],
    languageOptions: sharedParser,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@daygraph/db", "@daygraph/db/*"],
              message: "Renderer must read activity data through window.api, not packages/db.",
            },
            {
              group: ["@daygraph/collector", "@daygraph/collector/*"],
              message: "Renderer must not import collector internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/shared/src/**/*.{ts,tsx}"],
    languageOptions: sharedParser,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@daygraph/db", "@daygraph/db/*", "@daygraph/collector", "@daygraph/collector/*"],
              message: "Shared may define contracts only; it must not depend on implementation packages.",
            },
          ],
          paths: [
            {
              name: "electron",
              message: "Shared must stay serializable and Electron-free.",
            },
            {
              name: "react",
              message: "Shared must stay UI-framework-free.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/db/src/**/*.{ts,tsx}", "packages/collector/src/**/*.{ts,tsx}"],
    languageOptions: sharedParser,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "Runtime packages must not import renderer UI dependencies.",
            },
          ],
        },
      ],
    },
  },
];
