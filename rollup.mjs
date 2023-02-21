import {rollup} from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

const inputOptions = {
    input: 'src/index.ts',
    plugins: [
        typescript(),
        resolve(),
        commonjs({include: 'node_modules/**'}),
        autoExternal({dependencies: false}),
        sourcemaps(),
        babel({exclude: 'node_modules/**', extensions: ['.js', '.ts', '.tsx']}),
        terser({mangle: false}),
    ],
    external: ['react/jsx-runtime'],
};

const build = async () => {
    const bundle = await rollup(inputOptions);
    bundle.write({format: 'cjs', file: 'cjs/index.js', sourcemap: true});
    bundle.write({format: 'es', file: 'es/index.js', sourcemap: true});
};

build();
