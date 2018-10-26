module.exports = {
    verbose: true,
    testURL: 'http://localhost/',
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
            statements: 90
        }
    }
};
