/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    mode: 'development',
    entry: {
        index: './demo/index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [
                    /node_modules/,
                    require.resolve('./demo/parse')
                ],
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    },
                    'eslint-loader'
                ]
            },
            {
                test: require.resolve('./demo/parse'),
                use: ['worker-loader']
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
        modules: ['node_modules']
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
