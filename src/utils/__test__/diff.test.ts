import {describe, test, expect} from 'vitest';
import dedent from 'dedent';
import {parseDiff} from '../parse';
import {
    textLinesToHunk,
    insertHunk,
    expandFromRawCode,
    getCollapsedLinesCountBetween,
    expandCollapsedBlockBy,
    getChangeKey,
    ChangeData,
    HunkData,
} from '../index';

const sample = dedent`
    diff --git a/src/__test__/index.test.jsx b/src/__test__/index.test.jsx
    index 643c2f0..7883597 100644
    --- a/src/__test__/index.test.jsx
    +++ b/src/__test__/index.test.jsx
    @@ -21,3 +21,3 @@ describe('basic test', () => {
         test('App renders correctly', () => {
    -        expect(renderer.create(<App diffText={'deff'} />).toJSON()).toMatchSnapshot();
    +        expect(renderer.create(<App diffText={'diff'} />).toJSON()).toMatchSnapshot();
         });
`;

export const sampleHunk = parseDiff(sample)[0].hunks[0];

const normalChange: ChangeData = {type: 'normal', isNormal: true, oldLineNumber: 1, newLineNumber: 1, content: ''};

const insertChange: ChangeData = {type: 'insert', isInsert: true, lineNumber: 2, content: ''};

const deleteChange: ChangeData = {type: 'delete', isDelete: true, lineNumber: 2, content: ''};

describe('textLinesToHunk', () => {
    test('basic', () => {
        const lines = [''];
        expect(textLinesToHunk(lines, 0, 0)).toMatchSnapshot();
    });
});

describe('insertHunk', () => {
    test('basic', () => {
        const results = insertHunk(
            [{changes: [normalChange], content: '', oldStart: 1, newStart: 1, oldLines: 1, newLines: 1}],
            {changes: [deleteChange], content: '', oldStart: 2, newStart: 2, oldLines: 1, newLines: 1}
        );
        expect(results.length).toBe(1);
        expect(results[0].changes).toEqual([normalChange, deleteChange]);
    });
});

describe('expandFromRawCode', () => {
    test('basic', () => {
        const hunks = [sampleHunk];
        expect(expandFromRawCode(hunks, '', 22, 23)).toMatchSnapshot();
    });
});

describe('getCollapsedLinesCountBetween', () => {
    test('basic', () => {
        const previousHunk: HunkData = {content: '', oldStart: 1, oldLines: 2, newStart: 1, newLines: 2, changes: []};
        const nextHunk: HunkData = {content: '', oldStart: 10, oldLines: 2, newStart: 10, newLines: 2, changes: []};
        expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(7);
    });

    test('minus number', () => {
        const previousHunk: HunkData = {content: '', oldStart: 1, oldLines: 10, newStart: 1, newLines: 2, changes: []};
        const nextHunk: HunkData = {content: '', oldStart: 2, oldLines: 2, newStart: 10, newLines: 2, changes: []};
        expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(-9);
    });

    test('no previousHunk', () => {
        const nextHunk: HunkData = {content: '', oldStart: 2, oldLines: 2, newStart: 10, newLines: 2, changes: []};
        expect(getCollapsedLinesCountBetween(null, nextHunk)).toBe(1);
    });
});

describe('expandCollapsedBlockBy', () => {
    test('basic', () => {
        const hunks = [sampleHunk];
        expect(expandCollapsedBlockBy(hunks, '', () => false)).toMatchSnapshot();
    });

    test('normal hunk', () => {
        const hunks: HunkData[] = [
            {
                content: '@@ -1,2 +1,2 @@',
                oldStart: 1,
                newStart: 1,
                oldLines: 2,
                newLines: 2,
                changes: [{
                    content: 'iiiiiiiiiiiiiiiiiiiiii:WQiiiiiiiiiiiiejj',
                    type: 'normal',
                    isNormal: true,
                    oldLineNumber: 1,
                    newLineNumber: 1,
                }, {
                    content: 'dsds',
                    type: 'delete',
                    isDelete: true,
                    lineNumber: 2,
                }, {
                    content: 'dsdsds',
                    type: 'insert',
                    isInsert: true,
                    lineNumber: 2,
                }],
            },
        ];
        const rawCode = 'iiiiiiiiiiiiiiiiiiiiii:WQiiiiiiiiiiiiejj\ndsds';
        expect(expandCollapsedBlockBy(hunks, rawCode, () => false)).toMatchSnapshot();
        expect(expandCollapsedBlockBy(hunks, rawCode.split('\n'), () => false)).toMatchSnapshot();
        expect(expandFromRawCode(hunks, rawCode, 0, 10)).toMatchSnapshot();
    });
});

describe('getChangeKey', () => {
    test('normal change', () => {
        expect(getChangeKey(normalChange)).toBe('N1');
    });

    test('insert change', () => {
        expect(getChangeKey(insertChange)).toBe('I2');
    });

    test('delete change', () => {
        expect(getChangeKey(deleteChange)).toBe('D2');
    });
});
