/* eslint-disable import/unambiguous, import/no-commonjs */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
                test: /\.css$/,
                exclude: [
                    /node_modules/,
                    /react-diff-view\/src/,
                ],
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            camelCase: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                include: [
                    /node_modules/,
                    /react-diff-view\/src/,
                ],
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            import: true,
                        },
                    },
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
