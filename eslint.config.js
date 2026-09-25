"use strict";

// Flat config for ESLint 9+. Run with: npm run lint
// Requires: npm install (installs eslint as a devDependency).

const js = require("@eslint/js");

const nodeGlobals = {
  require: "readonly",
  module: "writable",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  setInterval: "readonly",
  URL: "readonly",
  fetch: "readonly"
};

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  fetch: "readonly",
  localStorage: "readonly",
  FormData: "readonly",
  confirm: "readonly",
  console: "readonly"
};

module.exports = [
  js.configs.recommended,
  {
    ignores: ["node_modules/**", "data/**"]
  },
  {
    files: ["server.js", "lib/**/*.js", "routes/**/*.js", "api/**/*.js", "test/**/*.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: nodeGlobals
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "smart"]
    }
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: browserGlobals
    },
    rules: {
      "no-unused-vars": "warn",
      "no-var": "error"
    }
  }
];
