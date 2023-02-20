module.exports = {
    extends: [
        '@ecomfe/eslint-config/strict',
        '@ecomfe/eslint-config/react/strict',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'react-hooks/exhaustive-deps': 'error',
    },
};
