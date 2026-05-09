import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  forceExit: true,
  detectOpenHandles: true,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: false,
      },
    ],
  },
};

export default config;
