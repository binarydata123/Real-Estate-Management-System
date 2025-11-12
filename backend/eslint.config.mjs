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
        "no-undef": "warn", // Detects use of undeclared variables
        "no-console": "warn", // Discourages use of console (prefer proper logger)
        "no-extra-semi": "error", // Prevents unnecessary semicolons
        "no-unexpected-multiline": "error", // Avoids ambiguity from missing semicolons
        "no-var": "error", // Enforces use of let/const instead of var
        "prefer-const": "error", // Suggests const for variables that are never reassigned
        "eqeqeq": "error", // Enforces strict equality (=== and !==)
        "curly": "off", // Requires braces around loops and conditionals
        "no-empty": "error", // Disallow empty code blocks
        "no-multi-spaces": "error", // Disallow multiple spaces in code
        "no-trailing-spaces": "error", // Disallow trailing whitespace
        "semi": "error", // Enforce consistent semicolon usage
        "quotes": "off", // Enforce consistent quote style
        // 🔹 Best Practices for Maintainability
        "consistent-return": "error", // Requires consistent return statements
        "default-case": "error", // Enforce default clause in switch statements
        "no-fallthrough": "off", // Disallow fallthrough of case statements
        "no-redeclare": "error", // Disallow variable redeclaration
        "no-return-await": "error", // Avoid unnecessary await in return
        "no-shadow": "error", // Prevents variable shadowing
        "no-useless-catch": "error", // Disallow redundant catch blocks
        "no-useless-return": "error", // Disallow redundant return statements
        "no-param-reassign": "error", // Disallow reassigning function parameters

        // 🔹 Node.js & Security Related
        "callback-return": "error", // Ensures callbacks are invoked properly
        "handle-callback-err": "error", // Enforces handling of callback offs
        "no-process-exit": "error", // Disallow process.exit()
        "no-sync": "error", // Warn on sync methods in async code
        "security/detect-non-literal-fs-filename": "off", // Detects dynamic filenames in fs methods
        "security/detect-object-injection": "off", // Prevents unsafe object property access
        "security/detect-child-process": "off", // Prevents child_process misuse

        // 🔹 Performance & Optimization
        "no-useless-concat": "error", // Detects unnecessary string concatenation
        "no-new-func": "error", // Prevents Function constructor (expensive + unsafe)
        "no-implied-eval": "error", // Prevents eval-like code
        "prefer-spread": "error", // Suggests using spread instead of apply()
        "no-loop-func": "error", // Prevents function definitions inside loops

        // 🔹 Modern JavaScript / ES6+
        "prefer-arrow-callback": "error", // Suggests arrow functions for callbacks
        "arrow-spacing": "error", // Enforces spacing around arrow function arrows
        "object-shorthand":"off", // Suggests shorthand property syntax
        "no-duplicate-imports": "error", // Prevent duplicate module imports
        "no-const-assign": "error", // Prevents reassignment of const variables
        "prefer-template": "error", // Suggests using template literals over +
        "rest-spread-spacing": "error", // Enforces spacing for rest/spread syntax

        // 🔹 Formatting / Readability
        "comma-dangle": "off", // Enforce consistent trailing commas
        "space-before-blocks": "error", // Enforce space before blocks
        "space-before-function-paren": "error", // Enforce spacing before function parentheses
        "keyword-spacing": "error", // Enforce consistent spacing before/after keywords
        "brace-style": "error", // Enforce consistent brace style
        "arrow-body-style": "off", // Enforce braces for arrow function bodies
      },
    },
];
