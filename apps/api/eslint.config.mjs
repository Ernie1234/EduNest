import { config as baseConfig } from "@workspace/eslint-config/base"
import globals from "globals"

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ["**/*.spec.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]
