export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "logs/**",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // 🔹 General Code Quality Rules
      "no-unused-vars": "error", // Warns about declared but unused variables
      "no-undef": "off", // Detects use of undeclared variables
      "no-console": "off", // Discourages use of console (prefer proper logger)
      "no-extra-semi": "error", // Prevents unnecessary semicolons
      "no-unexpected-multiline": "error", // Avoids ambiguity from missing semicolons
      "no-var": "off", // Enforces use of let/const instead of var
      "prefer-const": "off", // Suggests const for variables that are never reassigned
      eqeqeq: "error", // Enforces strict equality (=== and !==)
      curly: "off", // Requires braces around loops and conditionals
      "no-empty": "error", // Disallow empty code blocks
      "no-multi-spaces": "error", // Disallow multiple spaces in code
      "no-trailing-spaces": "off", // Disallow trailing whitespace
      semi: "off", // Enforce consistent semicolon usage
      quotes: "off", // Enforce consistent quote style
      indent: "off", // Enforce consistent indentation

      // 🔹 Best Practices for Maintainability
      "consistent-return": "off", // Requires consistent return statements
      "default-case": "error", // Enforce default clause in switch statements
      "no-fallthrough": "off", // Disallow fallthrough of case statements
      "no-redeclare": "error", // Disallow variable redeclaration
      "no-return-await": "off", // Avoid unnecessary await in return
      "no-shadow": "off", // Prevents variable shadowing
      "no-useless-catch": "off", // Disallow redundant catch blocks
      "no-useless-return": "off", // Disallow redundant return statements
      "no-param-reassign": "off", // Disallow reassigning function parameters

      // 🔹 Node.js & Security Related
      "callback-return": "off", // Ensures callbacks are invoked properly
      "handle-callback-err": "off", // Enforces handling of callback offs
      "no-process-exit": "off", // Disallow process.exit()
      "no-sync": "off", // Warn on sync methods in async code
      "security/detect-non-literal-fs-filename": "off", // Detects dynamic filenames in fs methods
      "security/detect-object-injection": "off", // Prevents unsafe object property access
      "security/detect-child-process": "off", // Prevents child_process misuse

      // 🔹 Performance & Optimization
      "no-useless-concat": "off", // Detects unnecessary string concatenation
      "no-new-func": "off", // Prevents Function constructor (expensive + unsafe)
      "no-implied-eval": "off", // Prevents eval-like code
      "prefer-spread": "off", // Suggests using spread instead of apply()
      "no-loop-func": "off", // Prevents function definitions inside loops

      // 🔹 Modern JavaScript / ES6+
      "prefer-arrow-callback": "off", // Suggests arrow functions for callbacks
      "arrow-spacing": "off", // Enforces spacing around arrow function arrows
      "object-shorthand": "off", // Suggests shorthand property syntax
      "no-duplicate-imports": "error", // Prevent duplicate module imports
      "no-const-assign": "error", // Prevents reassignment of const variables
      "prefer-template": "off", // Suggests using template literals over +
      "rest-spread-spacing": "off", // Enforces spacing for rest/spread syntax

      // 🔹 Formatting / Readability
      "comma-dangle": "off", // Enforce consistent trailing commas
      "space-before-blocks": "off", // Enforce space before blocks
      "space-before-function-paren": "off", // Enforce spacing before function parentheses
      "keyword-spacing": "off", // Enforce consistent spacing before/after keywords
      "brace-style": "off", // Enforce consistent brace style
      "arrow-body-style": "off", // Enforce braces for arrow function bodies
    },
  },
];
