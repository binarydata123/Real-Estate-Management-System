import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      /* 🧹 --- Code Cleanliness & Maintainability --- */

      "@typescript-eslint/no-unused-vars": [
        "error", // Prevent unused variables (on = cleaner code)
        { argsIgnorePattern: "^_" },
      ],
      "no-console": "off", // Disallow console.log for production-quality code
      "no-debugger": "off", // Disallow use of debugger statements
      "no-var": "off", // Enforce let/const instead of var
      "prefer-const": "error", // Suggest using const when variables are never reassigned
      "no-duplicate-imports": "error", // Avoid duplicate imports (performance + clarity)
      "no-empty": "error", // Prevent empty blocks that can hide issues
      "no-extra-semi": "error", // Prevent unnecessary semicolons
      "no-trailing-spaces": "off", // Enforce removing trailing spaces
      "eol-last": "off", // Enforce newline at end of file (consistency)

      /* ⚙️ --- TypeScript Best Practices --- */

      "@typescript-eslint/no-explicit-any": "error", // Discourage use of 'any' (strong typing)
      "@typescript-eslint/no-inferrable-types": "error", // Avoid redundant type declarations
      "@typescript-eslint/ban-ts-comment": "error", // Prevent misuse of // @ts-ignore and similar

      /* 🌍 --- Next.js Performance & Structure --- */

      "@next/next/no-img-element": "off", // Prefer <Image /> for optimization
      "@next/next/no-html-link-for-pages": "off", // Prevent using <a> for internal routing (use next/link)
      "@next/next/no-document-import-in-page": "off", // Prevent importing _document in pages
      "@next/next/no-head-element": "off", // Enforce <Head> from 'next/head' for metadata
      "@next/next/no-sync-scripts": "off", // Warn for blocking scripts (performance)
      "@next/next/no-page-custom-font": "off", // Enforce font optimization through next/font

      /* ⚡ --- Performance & Optimization --- */

      "no-unused-expressions": "error", // Disallow useless expressions (improves readability)
      "no-constant-condition": "error", // Catch accidental always-true/false conditions
      "no-unreachable": "error", // Prevent unreachable code
      "no-return-assign": "error", // Prevent assignments in return statements
      "no-self-compare": "error", // Disallow comparing a variable to itself
      "no-useless-concat": "error", // Avoid unnecessary string concatenation
      "no-useless-return": "error", // Remove redundant return statements
      "no-else-return": "error", // Simplify returns by removing unnecessary else
      "prefer-template": "error", // Prefer template literals over concatenation
      "no-multi-str": "error", // Avoid multiline string literals (use template strings)
      "eqeqeq": "error", // Enforce === and !== for type-safe comparisons

      /* 💄 --- Code Style / Consistency --- */

      "semi": ["off", "always"], // Enforce consistent semicolon usage
      "comma-dangle": ["off", "always-multiline"], // Trailing commas for cleaner diffs
      "object-curly-spacing": ["error", "always"], // Consistent spacing in object literals
      "arrow-spacing": "off", // Ensure spacing around arrow functions
      "keyword-spacing": "off", // Ensure spacing around keywords
      "spaced-comment": "off", // Enforce consistent spacing after comment slashes

      /* 🧠 --- Code Safety --- */

      "no-fallthrough": "error", // Prevent switch case fallthrough
      "no-unsafe-finally": "error", // Prevent unsafe behavior in finally blocks
      "no-redeclare": "error", // Prevent redeclaring variables
      "no-shadow": "error", // Prevent variable shadowing
      "no-delete-var": "error", // Prevent deleting variables (not allowed in strict mode)
      "no-inner-declarations": "error", // Prevent declarations inside blocks
      "no-eval": "error", // Disallow eval() for security
      "no-implied-eval": "error", // Disallow implied eval-like code
      "no-script-url": "error", // Prevent javascript: URLs (security)

    },
  },
];

export default eslintConfig;
