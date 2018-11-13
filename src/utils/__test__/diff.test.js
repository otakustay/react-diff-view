import {
    textLinesToHunk,
    insertHunk,
    expandFromRawCode,
    getCollapsedLinesCountBetween,
    expandCollapsedBlockBy,
    getChangeKey,
} from '..';
import {normalChange, insertChange, deleteChange} from '../../__test__/changes.case';
import {basicHunk} from '../../__test__/cases';


describe('textLinesToHunk', () => {
    test('basic', () => {
        const lines = [''];
        expect(textLinesToHunk(lines, 0, 0)).toMatchSnapshot();
    });
});

describe('insertHunk', () => {
    test('basic', () => {
        expect(insertHunk(
            [{changes: [{isInsert: true, lineNumber: 0, oldLineNumber: 0}]}],
            {changes: [{isInsert: true, lineNumber: 1, oldLineNumber: 1}]}
        )).toEqual(
            [{changes: [{isInsert: true, lineNumber: 1, oldLineNumber: 1}]}]
        );
    });
});

describe('expandFromRawCode', () => {
    test('basic', () => {
        const hunks = [basicHunk];
        expect(expandFromRawCode(hunks, '')).toMatchSnapshot();
    });
});

describe('getCollapsedLinesCountBetween', () => {
    test('empty', () => {
        const previousHunk = {};
        const nextHunk = {};
        expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(NaN);
    });

    test('basic', () => {
        const previousHunk = {oldStart: 1, oldLines: 2};
        const nextHunk = {oldStart: 10};
        expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(7);
    });

    test('minus number', () => {
        const previousHunk = {oldStart: 1, oldLines: 10};
        const nextHunk = {oldStart: 2};
        expect(getCollapsedLinesCountBetween(previousHunk, nextHunk)).toBe(-9);
    });

    test('no previousHunk', () => {
        const nextHunk = {oldStart: 2};
        expect(getCollapsedLinesCountBetween(null, nextHunk)).toBe(1);
    });

    test('throw when nextHunk is null', () => {
        expect(() => getCollapsedLinesCountBetween({}, null)).toThrow();
    });
});

describe('expandCollapsedBlockBy', () => {
    test('basic', () => {
        const hunks = [basicHunk];
        const noop = () => {/* noop */};
        expect(expandCollapsedBlockBy(hunks, '', noop)).toMatchSnapshot();
    });
});

describe('getChangeKey', () => {
    test('throws when empty', () => {
        expect(() => getChangeKey()).toThrow();
    });

    test('normal change', () => {
        expect(getChangeKey(normalChange)).toBe('N0');
    });

    test('insert change', () => {
        expect(getChangeKey(insertChange)).toBe('I0');
    });

    test('delete change', () => {
        expect(getChangeKey(deleteChange)).toBe('D0');
    });
});
