module.exports = {
    extends: [
        '@ecomfe/eslint-config/strict',
        '@ecomfe/eslint-config/react/strict',
        '@ecomfe/eslint-config/typescript/strict',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'consistent-return': 'off',
    },
};
