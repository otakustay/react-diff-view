/* eslint-disable global-require */
module.exports = {
    plugins: [
        require('autoprefixer'),
        require('postcss-custom-properties')(),
        require('cssnano')(),
    ],
};
