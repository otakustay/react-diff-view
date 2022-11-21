import {configure} from '@reskript/settings';

export default configure(
    'webpack',
    {
        build: {
            appTitle: 'Online Diff',
            publicPath: '/react-diff-view/assets/',
            style: {
                modules: resource => resource.endsWith('.less') && !resource.includes('node_modules'),
            },
        },
        devServer: {
            port: 9031,
        },
    }
);
