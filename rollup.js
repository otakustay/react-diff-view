const {rollup} = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const autoExternal = require('rollup-plugin-auto-external');
const sourcemaps = require('rollup-plugin-sourcemaps');
const babel = require('rollup-plugin-babel');
const {terser} = require('rollup-plugin-terser');

const inputOptions = {
    input: 'src/index.js',
    plugins: [
        resolve(),
        commonjs({include: 'node_modules/**'}),
        autoExternal({dependencies: false}),
        sourcemaps(),
        babel({exclude: 'node_modules/**'}),
        terser({mangle: false}),
    ],
};

const build = async () => {
    const bundle = await rollup(inputOptions);
    bundle.write({format: 'cjs', file: 'cjs/index.js', sourcemap: true});
    bundle.write({format: 'es', file: 'es/index.js', sourcemap: true});
};

build();
