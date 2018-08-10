/* eslint-disable import/unambiguous, import/no-commonjs */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: path.resolve(__dirname, '..'),
    mode: 'development',
    entry: {
        index: './demo/index.js'
    },
    output: {
        filename: '[name].[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: ['worker-loader']
            },
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    /\.worker\.js$/
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: ['svg-react-loader']
            },
            {
                test: /\.(diff|raw)$/,
                use: ['raw-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
        alias: {
            'react-diff-view': path.resolve(__dirname, '..', 'src')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({title: 'react-diff-view'}),
        new CopyWebpackPlugin([{from: 'demo/assets', to: 'assets'}])
    ],
    devServer: {
        port: 9030,
        open: true,
        inline: true,
        hot: false
    }
};
