// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    settings: {
      react: {
        // preact: mark h() as being a used variable.
        pragma: "h",
        // preact: use "react 16.0" to avoid pushing folks to UNSAFE_ methods.
        version: "18.0",
      },
    },
  },
  reactPlugin.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
);
