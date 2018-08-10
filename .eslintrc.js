module.exports = {
    extends: '@ecomfe/eslint-config/strict',
    rules: {
        'import/no-unresolved': [
            'error',
            {ignore: ['react-diff-view']}
        ]
    }
};
