/**
 * @file 基础webpack配置
 * @author zhanglili
 */

const path = require('path');
const {LoaderOptionsPlugin, optimize: {ModuleConcatenationPlugin}} = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    context: __dirname,
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
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({use: 'css-loader'})
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
        new ExtractTextPlugin('index.css'),
        new ModuleConcatenationPlugin(),
        new UglifyJSPlugin({sourceMap: true}),
        new LoaderOptionsPlugin({minimize: true, debug: false}),
        new CaseSensitivePathsPlugin()
    ]
};
