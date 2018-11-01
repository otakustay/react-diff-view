module.exports = {
    extends: '@ecomfe/eslint-config/strict',
    plugins: ['jest'],
    env: {
        'jest/globals': true
    },
    rules: {
        'import/no-unresolved': [
            'error',
            {ignore: ['react-diff-view']}
        ]
    }
};
