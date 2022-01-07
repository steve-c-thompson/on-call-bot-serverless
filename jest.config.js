module.exports = {
    roots: ["<rootDir>"],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}"
    ],
    moduleFileExtensions: [
        "ts",
        "js",
        "tsx",
        "jsx"
    ],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/?(*.)(spec|test).ts?(x)"
    ],
    testEnvironment: "node",
    setupFilesAfterEnv: [
        "<rootDir>/src/setupTests.ts"
    ]
};