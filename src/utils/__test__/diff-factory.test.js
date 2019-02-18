import {
    computeLineNumberFactory,
    isInHunkFactory,
    isBetweenHunksFactory,
    findChangeByLineNumberFactory,
    getCorrespondingLineNumberFactory,
} from '../diff/factory';
// import {normalChange, insertChange, deleteChange} from '../../__test__/changes.case';
// import {basicHunk} from '../../__test__/cases';

describe('factory', () => {
    test('returns a function', () => {
        expect(typeof computeLineNumberFactory()).toBe('function');
        expect(typeof isInHunkFactory()).toBe('function');
        expect(typeof isBetweenHunksFactory()).toBe('function');
        expect(typeof findChangeByLineNumberFactory()).toBe('function');
        expect(typeof getCorrespondingLineNumberFactory()).toBe('function');
    });
});

describe('computeLineNumber', () => {
    test('old', () => {
        const computeOldLineNumber = computeLineNumberFactory('old');
        expect(computeOldLineNumber({isInsert: true})).toBe(-1);
        expect(computeOldLineNumber({isNormal: true, lineNumber: 0, oldLineNumber: 1})).toBe(1);
        expect(computeOldLineNumber({isNormal: false, lineNumber: 0, oldLineNumber: 1})).toBe(0);
    });

    test('new', () => {
        const computeNewLineNumber = computeLineNumberFactory('new');
        expect(computeNewLineNumber({isDelete: true})).toBe(-1);
        expect(computeNewLineNumber({isNormal: true, lineNumber: 0, newLineNumber: 1})).toBe(1);
        expect(computeNewLineNumber({isNormal: false, lineNumber: 0, newLineNumber: 1})).toBe(0);
    });
});

describe('isInHunk', () => {
    test('old', () => {
        const isInOldHunk = isInHunkFactory('oldStart', 'oldLines');
        expect(isInOldHunk({oldStart: 1, oldLines: 2}, 2)).toBe(true);
        expect(isInOldHunk({oldStart: 1, oldLines: 2}, 3)).toBe(false);
    });

    test('new', () => {
        const isInNewHunk = isInHunkFactory('newStart', 'newLines');
        expect(isInNewHunk({newStart: 1, newLines: 2}, 2)).toBe(true);
        expect(isInNewHunk({newStart: 1, newLines: 2}, 3)).toBe(false);
    });
});

describe('isBetweenHunks', () => {
    test('old', () => {
        const isOldLineNumberBetweenHunks = isBetweenHunksFactory('oldStart', 'oldLines');
        expect(isOldLineNumberBetweenHunks({oldStart: 1, oldLines: 2}, {oldStart: 4}, 2)).toBe(false);
        expect(isOldLineNumberBetweenHunks({oldStart: 1, oldLines: 2}, {oldStart: 4}, 3)).toBe(true);
    });

    test('new', () => {
        const isNewLineNumberBetweenHunks = isBetweenHunksFactory('newStart', 'newLines');
        expect(isNewLineNumberBetweenHunks({newStart: 1, newLines: 2}, {newStart: 4}, 2)).toBe(false);
        expect(isNewLineNumberBetweenHunks({newStart: 1, newLines: 2}, {newStart: 4}, 3)).toBe(true);
    });
});

describe('findChangeByLineNumber', () => {
    test('old', () => {
        const findChangeByLineNumber = findChangeByLineNumberFactory('old');
        const change = {isNormal: true, lineNumber: 0, oldLineNumber: 1};
        const hunk = {oldStart: 1, oldLines: 2, changes: [change]};
        expect(findChangeByLineNumber([hunk], 1)).toBe(change);
        expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });

    test('new', () => {
        const findChangeByLineNumber = findChangeByLineNumberFactory('new');
        const change = {isNormal: true, lineNumber: 0, newLineNumber: 1};
        const hunk = {newStart: 1, newLines: 2, changes: [change]};
        expect(findChangeByLineNumber([hunk], 1)).toBe(change);
        expect(findChangeByLineNumber([hunk], 3)).toBe(undefined);
    });
});

describe('getCorrespondingLineNumber', () => {
    test('old', () => {
        // getNewCorrespondingLineNumber is the same
        const getOldCorrespondingLineNumber = getCorrespondingLineNumberFactory('old');
        const hunk = {oldStart: 10, oldLines: 5, newStart: 20, newLines: 5, changes: []};
        expect(() => getOldCorrespondingLineNumber([], 0)).toThrow();
        expect(getOldCorrespondingLineNumber([hunk], 0)).toBe(10);
        expect(getOldCorrespondingLineNumber([hunk], 20)).toBe(30);

        hunk.changes = [{isNormal: true, oldLineNumber: 11}];
        expect(getOldCorrespondingLineNumber([hunk], 11)).toBe(undefined);

        hunk.changes = [{isNormal: true, oldLineNumber: 12, newLineNumber: 22}];
        expect(getOldCorrespondingLineNumber([hunk], 12)).toBe(22);

        hunk.changes = [{isInsert: true, lineNumber: 13}];
        expect(() => getOldCorrespondingLineNumber([hunk], 13)).toThrow();

        hunk.changes = [{isDelete: true, lineNumber: 14}];
        expect(getOldCorrespondingLineNumber([hunk], 14)).toBe(-1);

        const nextHunk = {oldStart: 20, oldLines: 5, newStart: 30, newLines: 5, changes: []};
        expect(getOldCorrespondingLineNumber([hunk, nextHunk], 16)).toBe(26);
    });
});
