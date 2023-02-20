import {describe, test, expect} from 'vitest';
import {
    computeLineNumberFactory,
    isInHunkFactory,
    isBetweenHunksFactory,
    findChangeByLineNumberFactory,
    getCorrespondingLineNumberFactory,
} from '../diff/factory';
import {ChangeData, HunkData} from '../parse';

const normalChange: ChangeData = {type: 'normal', isNormal: true, oldLineNumber: 1, newLineNumber: 1, content: ''};

const insertChange: ChangeData = {type: 'insert', isInsert: true, lineNumber: 2, content: ''};

const deleteChange: ChangeData = {type: 'delete', isDelete: true, lineNumber: 2, content: ''};

const sampleHunk: HunkData = {
    content: '',
    oldStart: 1,
    oldLines: 2,
    newStart: 1,
    newLines: 2,
    changes: [],
};

const nextHunk: HunkData = {
    content: '',
    oldStart: 4,
    oldLines: 2,
    newStart: 4,
    newLines: 2,
    changes: [],
};

describe('computeLineNumber', () => {
    test('old', () => {
        const computeOldLineNumber = computeLineNumberFactory('old');
        expect(computeOldLineNumber(insertChange)).toBe(-1);
        expect(computeOldLineNumber(normalChange)).toBe(1);
        expect(computeOldLineNumber(deleteChange)).toBe(2);
    });

    test('new', () => {
        const computeNewLineNumber = computeLineNumberFactory('new');
        expect(computeNewLineNumber(deleteChange)).toBe(-1);
        expect(computeNewLineNumber(normalChange)).toBe(1);
        expect(computeNewLineNumber(insertChange)).toBe(2);
    });
});

describe('isInHunk', () => {
    test('old', () => {
        const isInOldHunk = isInHunkFactory('oldStart', 'oldLines');
        expect(isInOldHunk(sampleHunk, 2)).toBe(true);
        expect(isInOldHunk(sampleHunk, 3)).toBe(false);
    });

    test('new', () => {
        const isInNewHunk = isInHunkFactory('newStart', 'newLines');
        expect(isInNewHunk(sampleHunk, 2)).toBe(true);
        expect(isInNewHunk(sampleHunk, 3)).toBe(false);
    });
});

describe('isBetweenHunks', () => {
    test('old', () => {
        const isOldLineNumberBetweenHunks = isBetweenHunksFactory('oldStart', 'oldLines');
        expect(isOldLineNumberBetweenHunks(sampleHunk, nextHunk, 2)).toBe(false);
        expect(isOldLineNumberBetweenHunks(sampleHunk, nextHunk, 3)).toBe(true);
    });

    test('new', () => {
        const isNewLineNumberBetweenHunks = isBetweenHunksFactory('newStart', 'newLines');
        expect(isNewLineNumberBetweenHunks(sampleHunk, nextHunk, 2)).toBe(false);
        expect(isNewLineNumberBetweenHunks(sampleHunk, nextHunk, 3)).toBe(true);
    });
});

describe('findChangeByLineNumber', () => {
    test('old', () => {
        const findChangeByLineNumber = findChangeByLineNumberFactory('old');
        const change: ChangeData = {type: 'normal', isNormal: true, oldLineNumber: 1, newLineNumber: 1, content: ''};
        const hunk: HunkData = {oldStart: 1, oldLines: 1, newStart: 1, newLines: 1, changes: [change], content: ''};
        expect(findChangeByLineNumber([hunk], 1)).toBe(change);
        expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });

    test('new', () => {
        const findChangeByLineNumber = findChangeByLineNumberFactory('new');
        const change: ChangeData = {type: 'normal', isNormal: true, oldLineNumber: 1, newLineNumber: 1, content: ''};
        const hunk: HunkData = {oldStart: 1, oldLines: 1, newStart: 1, newLines: 1, changes: [change], content: ''};
        expect(findChangeByLineNumber([hunk], 1)).toBe(change);
        expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });
});

describe('getCorrespondingLineNumber', () => {
    test('old', () => {
        // getNewCorrespondingLineNumber is the same
        const getOldCorrespondingLineNumber = getCorrespondingLineNumberFactory('old');
        const hunk: HunkData = {oldStart: 10, oldLines: 5, newStart: 20, newLines: 5, changes: [], content: ''};
        expect(() => getOldCorrespondingLineNumber([], 0)).toThrow();
        expect(getOldCorrespondingLineNumber([hunk], 0)).toBe(10);
        expect(getOldCorrespondingLineNumber([hunk], 20)).toBe(30);

        hunk.changes = [{type: 'normal', isNormal: true, oldLineNumber: 12, newLineNumber: 22, content: ''}];
        expect(getOldCorrespondingLineNumber([hunk], 12)).toBe(22);

        hunk.changes = [{type: 'insert', isInsert: true, lineNumber: 13, content: ''}];
        expect(() => getOldCorrespondingLineNumber([hunk], 13)).toThrow();

        hunk.changes = [{type: 'delete', isDelete: true, lineNumber: 14, content: ''}];
        expect(getOldCorrespondingLineNumber([hunk], 14)).toBe(-1);

        const nextHunk = {oldStart: 20, oldLines: 5, newStart: 30, newLines: 5, changes: [], content: ''};
        expect(getOldCorrespondingLineNumber([hunk, nextHunk], 16)).toBe(26);
    });
});
