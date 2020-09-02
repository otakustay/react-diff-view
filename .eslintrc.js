module.exports = {
    extends: [
        '@ecomfe/eslint-config/strict',
        '@ecomfe/eslint-config/react/strict',
    ],
    plugins: ['jest'],
    env: {
        'jest/globals': true
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    rules: {
        'react-hooks/exhaustive-deps': 'error'
    }
};
