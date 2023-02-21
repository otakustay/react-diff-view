import {describe, test, expect} from 'vitest';
import refractor from 'refractor';
import dedent from 'dedent';
import {parseDiff} from '../../utils';
import {markEdits, pickRanges, tokenize, TokenizeOptions} from '../index';

describe('tokenize', () => {
    test('basic', () => {
        const expected = {
            new: [[{type: 'text', value: ''}]],
            old: [[{type: 'text', value: ''}]],
        };
        expect(tokenize([], {})).toEqual(expected);
    });

    test('highlight', () => {
        const result = tokenize(
            [],
            {
                highlight: true,
                refractor,
                language: 'javascript',
            }
        );
        expect(result).toMatchSnapshot();

    });

    test('with old source', () => {
        const expected = {
            new: [[{type: 'text', value: 'A'}]],
            old: [[{type: 'text', value: 'A'}]],
        };
        expect(tokenize([], {oldSource: 'A'})).toEqual(expected);
    });

    test('withHunk', () => {
        const diff = dedent`
            diff --git a/package.json b/package.json
            index 4778f48..c0edd5f 100644
            --- a/package.json
            +++ b/package.json
            @@ -13,7 +13,7 @@
                 ],
                 "scripts": {
                 "prepare": "husky install",
            -    "test": "jest --config ./jest.config.js",
            +    "test": "vitest run --coverage",
                 "start": "skr dev --src-dir=site",
                 "clean": "rm -rf cjs es style types",
                 "build": "sh scripts/build.sh",
            @@ -49,11 +49,12 @@
                 "@reskript/settings": "5.7.4",
                 "@rollup/plugin-typescript": "^11.0.0",
                 "@types/dedent": "^0.7.0",
            +    "@types/diff-match-patch": "^1.0.32",
                 "@types/lodash": "^4.14.191",
                 "@types/react-test-renderer": "^18.0.0",
            +    "@types/refractor": "^2.8.0",
                 "antd": "^5.2.1",
                 "autoprefixer": "^10.4.13",
            -    "babel-jest": "^29.4.3",
                 "babel-loader": "^9.1.2",
                 "babel-plugin-add-react-displayname": "0.0.5",
                 "babel-plugin-import": "^1.13.6",
            @@ -66,14 +67,12 @@
                 "enzyme": "^3.11.0",
                 "enzyme-adapter-react-16": "^1.15.7",
                 "eslint": "^8.34.0",
            -    "eslint-plugin-jest": "^27.2.1",
                 "eslint-plugin-react": "^7.32.2",
                 "eslint-plugin-react-hooks": "^4.6.0",
                 "gitdiff-parser": "^0.2.2",
                 "html-webpack-plugin": "^5.5.0",
                 "husky": "^8.0.3",
                 "identity-obj-proxy": "^3.0.0",
            -    "jest": "^29.4.3",
                 "less": "^4.1.3",
                 "less-loader": "^11.1.0",
                 "lodash": "^4.17.21",
            @@ -101,7 +100,6 @@
                 "sha1": "^1.1.1",
                 "style-loader": "^3.3.1",
                 "styled-components": "^5.3.6",
            -    "ts-jest": "^29.0.5",
                 "typescript": "^4.9.5",
                 "unidiff": "^1.0.2",
                 "vitest": "^0.28.5",
        `;
        const [file] = parseDiff(diff);
        expect(tokenize(file.hunks)).toMatchSnapshot();
    });

    test('enhance', () => {
        const oldSource = dedent`
            // Copyright
            package com.xxx;
            import java.util.List;
            import java.util.Set;
        `;

        const diffText = `
            diff --git a/a b/b
            index 5b25e5b..772d084 100644
            --- a/a
            +++ b/b
            @@ -2,6 +2,7 @@
             package com.xxx;
            +import java.util.Date;
             import java.util.List;
             import java.util.Set;
        `;

        const defs = [
            {
                id: 'yz5k9m0BvISpUQ2asedw',
                type: 'def',
                row: 2,
                col: 9,
                binding: 'package',
                length: 7,
                token: 'com.xxx',
            },
        ];

        const [file] = parseDiff(diffText, {nearbySequences: 'zip'});
        const options: TokenizeOptions = {
            oldSource,
            highlight: false,
            enhancers: [
                markEdits(file.hunks, {type: 'block'}),
                pickRanges([], defs.map(i => ({...i, lineNumber: i.row, start: i.col - 1}))),
            ],
        };
        const tokens = tokenize(file.hunks, options);
        expect(tokens).toMatchSnapshot();
    });
});
