import { config as baseConfig } from "@workspace/eslint-config/base"
import globals from "globals"

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    rules: {
      // NestJS @Module(), @Global(), etc. are intentionally empty classes
      "@typescript-eslint/no-extraneous-class": ["warn", { allowWithDecorator: true }],
    },
  },
  {
    files: ["**/*.spec.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]
