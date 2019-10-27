module.exports = {
    extends: '@ecomfe/eslint-config/strict',
    plugins: ['jest', 'react-hooks'],
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
        ],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error'
    }
};
