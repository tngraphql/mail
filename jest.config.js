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
  "collectCoverageFrom": [
    "src/**/*.ts"
  ],
  // "testPathIgnorePatterns": [
  //   "/node_modules/",
  //   "/__utils"
  // ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: [
    "**/*.spec.ts",
    // "**/mail-fake.spec.ts",
    // "**/mail-facade.spec.ts",
    // "**/command.spec.ts",
    // "**/mail-manager.spec.ts",
    // "**/mailable.spec.ts",
    // "**/mailer.spec.ts",
    // "**/message.spec.ts",
    // "**/ses-transport.spec.ts",
    // "**/smtp-transport.spec.ts",
    // "**/memory-transport.spec.ts",
  ],
  // "setupTestFrameworkScriptFile": "<rootDir>/setupTests.js"
}
