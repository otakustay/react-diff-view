module.exports = {
    verbose: true,
    testURL: 'http://localhost/',
    setupFilesAfterEnv: ['<rootDir>src/__tests__/setup.ts'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 67,
            functions: 85,
            lines: 84,
            statements: 85,
        },
    },
    testMatch: ['<rootDir>src/**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
};
