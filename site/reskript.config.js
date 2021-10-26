// const path = require('path');

exports.build = {
    appTitle: 'Online Diff',
    // 无法编译 alias 下的 ts 代码，先用 npm 版本跑通
    // finalize: webpackConfig => {
    //     webpackConfig.resolve.alias['react-diff-view'] = path.resolve(__dirname, '..', 'cjs');
    //     return webpackConfig;
    // },
};

exports.devServer = {
    port: 9031,
};
