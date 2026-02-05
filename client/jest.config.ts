import { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom", // Simulates a browser environment
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // This helps Jest understand the @/ alias
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/context/(.*)$": "<rootDir>/context/$1",
  },
};

export default createJestConfig(config);
