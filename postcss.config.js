/* eslint-disable import/unambiguous, import/no-commonjs, global-require */
module.exports = {
    plugins: [
        require('autoprefixer'),
        require('postcss-custom-properties')(),
        require('cssnano')(),
    ],
};
