/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
    mode: "production",
    entry: {
        index: './src/index.js',
        parse: './src/parse.js'
    },
    output: {
        path: __dirname,
        filename: '[name].js',
        library: 'reactDiffView',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                    'eslint-loader'
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({use: {loader: 'css-loader', options: {minimize: true}}})
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules']
    },
    externals: {
        'react': {root: 'React', commonjs2: 'react', commonjs: 'react', amd: 'react'},
        'prop-types': {root: 'propTypes', commonjs2: 'prop-types', commonjs: 'prop-types', amd: 'prop-types'}
    },
    plugins: [
        new ExtractTextPlugin('index.css')
    ]
};
