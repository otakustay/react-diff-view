module.exports = {
    extends: '@ecomfe/eslint-config/strict',
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
        'import/no-unresolved': [
            'error',
            {ignore: ['react-diff-view']}
        ]
    }
};
