module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  preset: 'ts-jest',
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  forceExit: true,
  testEnvironment: 'node',
  // "testPathIgnorePatterns": [
  //   "/node_modules/",
  //   "/__utils"
  // ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: [
    "**/*.spec.ts",
    "**/*.spec.js",
    // "**/console/**/*.spec.ts",
    // "**/database/**/*.spec.ts",
    // "**/validate/**/*.spec.ts",

  ],
  // "setupTestFrameworkScriptFile": "<rootDir>/setupTests.js"
}