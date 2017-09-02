/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const {LoaderOptionsPlugin} = require('webpack');
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
                test: /\.worker\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            inline: true
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ]
            },
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
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: ['svg-react-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules']
    },
    plugins: [
        new LoaderOptionsPlugin({minimize: false, debug: false}),
        new HtmlWebpackPlugin({title: 'react-diff-view'}),
        new CaseSensitivePathsPlugin()
    ],
    devServer: {
        port: 9030,
        open: true,
        contentBase: path.join(__dirname, 'demo'),
        compress: true,
        inline: true,
        hot: false
    }
};
