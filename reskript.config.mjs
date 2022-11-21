import {configure} from '@reskript/settings';

export default configure(
    'webpack',
    {
        build: {
            appTitle: 'Online Diff',
            style: {
                modules: resource => resource.endsWith('.less') && !resource.includes('node_modules'),
            },
        },
        devServer: {
            port: 9031,
        },
    }
);
