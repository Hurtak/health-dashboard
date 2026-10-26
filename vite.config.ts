import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/health-dashboard/",
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
  lint: {
    ignorePatterns: ["dist/**", "coverage/**"],
    plugins: ["typescript", "unicorn", "oxc", "react"],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "error",
      "react/only-export-components": ["error", { allowConstantExport: true }],
      "react/unsupported-syntax": "error",
    },
  },
  fmt: { printWidth: 120, ignorePatterns: ["dist/**", "coverage/**"] },
});
