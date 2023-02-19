module.exports = {
    // preset: 'ts-jest/presets/js-with-ts-esm',
    // globals: {
    //     'ts-jest': {
    //         tsConfig: 'tsconfig.test.json',
    //     },
    // },
    verbose: true,
    transform: {
        '\\.(js|ts|tsx)$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}],
    },
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
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
