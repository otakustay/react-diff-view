/* eslint-disable import/unambiguous, import/no-commonjs */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const antdTheme = {
    '@component-background': 'var(--antd-component-background)',
    '@background-color-base': 'var(--antd-background-color-base)',
    '@heading-color': 'var(--antd-heading-color)',
    '@text-color': 'var(--antd-text-color)',
    '@text-color-secondary': 'var(--antd-text-color-secondary)',
    '@text-color-inverse': 'var(--antd-text-color-inverse)',
    '@icon-color-hover': 'var(--antd-icon-color-hover)',
    '@heading-color-dark': 'var(--antd-heading-color-dark)',
    '@text-color-dark': 'var(--antd-text-color-dark)',
    '@text-color-secondary-dark': 'var(--antd-text-color-secondary-dark)',
    '@item-active-bg': 'var(--antd-item-active-bg)',
    '@item-hover-bg': 'var(--antd-item-hover-bg)',
    '@border-color-base': 'var(--antd-border-color-base)',
    '@border-color-split': 'var(--antd-border-color-split)',
    '@background-color-light': 'var(--antd-background-color-light)',
    '@disabled-color': 'var(--antd-disabled-color)',
    '@disabled-bg': 'var(--antd-disabled-bg)',
    '@disabled-color-dark': 'var(--antd-disabled-color-dark)',
    '@btn-default-bg': 'var(--antd-btn-default-bg)',
    '@checkbox-check-color': 'var(--antd-checkbox-check-color)',
    '@input-bg': 'var(--antd-input-bg)',
    '@input-number-handler-active-bg': 'var(--antd-input-number-handler-active-bg)',
    '@table-selected-row-bg': 'var(--antd-table-selected-row-bg)',
    '@table-expanded-row-bg': 'var(--antd-table-expanded-row-bg)',
    '@tree-directory-selected-color': 'var(--antd-tree-directory-selected-color)',
    '@table-row-hover-bg': 'var(--antd-table-row-hover-bg)',
    '@popover-bg': 'var(--antd-popover-bg)',
    '@shadow-color': 'var(--antd-shadow-color)',
    '@btn-shadow': 'var(--antd-btn-shadow)',
    '@btn-primary-shadow': 'var(--antd-btn-primary-shadow)',
    '@btn-text-shadow': 'var(--antd-btn-text-shadow)',
    '@alert-success-border-color': 'var(--antd-alert-success-border-color)',
    '@alert-success-bg-color': 'var(--antd-alert-success-bg-color)',
    '@alert-info-border-color': 'var(--antd-alert-info-border-color)',
    '@alert-info-bg-color': 'var(--antd-alert-info-bg-color)',
    '@alert-warning-border-color': 'var(--antd-alert-warning-border-color)',
    '@alert-warning-bg-color': 'var(--antd-alert-warning-bg-color)',
    '@alert-error-border-color': 'var(--antd-alert-error-border-color)',
    '@alert-error-bg-color': 'var(--antd-alert-error-bg-color)',
};

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    mode: 'development',
    entry: {
        index: './index.js',
    },
    output: {
        filename: '[name].[hash].js',
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: ['worker-loader'],
            },
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    /\.worker\.js$/,
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                exclude: [
                    /node_modules/,
                    /\.global\.less$/,
                ],
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localsConvention: 'camelCase',
                        },
                    },
                    'less-loader',
                ],
            },
            {
                test: /\.global\.less$/,
                exclude: [
                    /node_modules/,
                ],
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.less$/,
                include: [
                    /node_modules/,
                ],
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            modifyVars: antdTheme,
                            javascriptEnabled: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(diff|raw)$/,
                use: ['raw-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
        alias: {
            'react-diff-view': path.resolve(__dirname, '..', 'src'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({title: 'Online Diff'}),
    ],
    devServer: {
        port: 9031,
        open: true,
        inline: true,
        hot: false,
    },
};
