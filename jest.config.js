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
            branches: 78,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
};
