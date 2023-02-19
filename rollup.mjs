import {rollup} from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

const inputOptions = {
    input: 'src/index.js',
    plugins: [
        typescript(),
        resolve(),
        // TODO: Will we one day get rid of all lodash functions？
        commonjs({include: 'node_modules/**', namedExports: {'node_modules/lodash/lodash.js': ['findLastIndex']}}),
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
