/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const {LoaderOptionsPlugin} = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    entry: {
        index: './demo/index.js'
    },
    output: {
        path: path.join(__dirname, 'demo', 'dist'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
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
        new LoaderOptionsPlugin({minimize: false}),
        new HtmlWebpackPlugin({title: 'react-diff-view'}),
        new CaseSensitivePathsPlugin(),
        new CopyWebpackPlugin([{from: 'demo/assets', to: 'assets'}])
    ],
    devServer: {
        // host: '0.0.0.0',
        port: 9030,
        open: true,
        inline: true,
        hot: false
    }
};
