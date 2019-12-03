module.exports = {
    verbose: true,
    testURL: 'http://localhost/',
    setupFilesAfterEnv: ['<rootDir>src/__test__/setup.js'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy'
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 67,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
};
