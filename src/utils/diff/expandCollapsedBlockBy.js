import {insertHunk, textLinesToHunk} from './insertHunk';
import {
    computeLineNumberFactory, isInHunkFactory, isBetweenHunksFactory, getCorrespondingLineNumberFactory,
} from './factory';
import {first} from './util';

const getCorrespondingNewLineNumber = getCorrespondingLineNumberFactory('old');

const computeOldLineNumber = computeLineNumberFactory('old');

const isOldLineNumberInHunk = isInHunkFactory('oldStart', 'oldLines');

const isOldLineNumberBetweenHunks = isBetweenHunksFactory('oldStart', 'oldLines');

const findCorrespondingValidHunkIndex = (hunks, oldLineNumber) => {
    if (!hunks.length) {
        return -1;
    }

    const firstHunk = first(hunks);
    if (oldLineNumber < firstHunk.oldStart || isOldLineNumberInHunk(firstHunk, oldLineNumber)) {
        return 0;
    }

    for (let i = 1; i < hunks.length; i++) {
        const currentHunk = hunks[i];

        if (isOldLineNumberInHunk(currentHunk, oldLineNumber)) {
            return i;
        }

        const previousHunk = hunks[i - 1];

        if (isOldLineNumberBetweenHunks(previousHunk, currentHunk, oldLineNumber)) {
            return i;
        }
    }

    return -1;
};

const findNearestNormalChangeIndex = ({changes}, start) => {
    const index = changes.findIndex(change => computeOldLineNumber(change) === start);

    for (let i = index; i < changes.length; i++) {
        const change = changes[i];

        if (change.isNormal) {
            return i;
        }
    }

    return -1;
};

const splitRangeToValidOnes = (hunks, start, end) => {
    const correspondingHunkIndex = findCorrespondingValidHunkIndex(hunks, start);

    // `start` is after all hunks, we believe all left lines are normal.
    if (correspondingHunkIndex === -1) {
        return [[start, end]];
    }

    const correspondingHunk = hunks[correspondingHunkIndex];

    // If `start` points to a line before this hunk, we collect all heading normal changes
    if (start < correspondingHunk.oldStart) {
        const headingChangesCount = correspondingHunk.changes.findIndex(change => !change.isNormal);
        const validEnd = correspondingHunk.oldStart + Math.max(headingChangesCount, 0);

        if (validEnd >= end) {
            return [[start, end]];
        }

        return [
            [start, validEnd],
            ...splitRangeToValidOnes(hunks, validEnd + 1, end),
        ];
    }

    // Now the `correspondingHunk` must be a hunk containing `start`,
    // however it is still possible that `start` is not a normal change
    const {changes} = correspondingHunk;
    const nearestNormalChangeIndex = findNearestNormalChangeIndex(correspondingHunk, start);

    // If there is no normal changes after `start`, splitting ends up here
    if (nearestNormalChangeIndex === -1) {
        return [];
    }

    const validStartChange = changes[nearestNormalChangeIndex];
    const validStart = computeOldLineNumber(validStartChange);
    // Iterate to `end`, if `end` falls out of hunk, we can split it to 2 ranges
    const adjacentChangesCount = changes.slice(nearestNormalChangeIndex + 1).findIndex(change => !change.isNormal);
    const validEnd = computeOldLineNumber(validStartChange) + Math.max(adjacentChangesCount, 0);

    if (validEnd >= end) {
        return [[validStart, end]];
    }

    return [
        [validStart, validEnd],
        ...splitRangeToValidOnes(hunks, validEnd + 1, end),
    ];
};

const expandCodeByValidRange = (hunks, rawCodeOrLines, [start, end]) => {
    // Note `end` is not inclusive, this is the same as `Array.prototype.slice` method
    const linesOfCode = typeof rawCodeOrLines === 'string' ? rawCodeOrLines.split('\n') : rawCodeOrLines;
    const slicedLines = linesOfCode.slice(Math.max(start, 1) - 1, end - 1);

    if (!slicedLines.length) {
        return hunks;
    }

    const slicedHunk = textLinesToHunk(slicedLines, start, getCorrespondingNewLineNumber(hunks, start));
    return insertHunk(hunks, slicedHunk);
};

export const expandFromRawCode = (hunks, rawCodeOrLines, start, end) => {
    // It is possible to have some insert or delete changes between `start` and `end`,
    // in order to be 100% safe, we need to split the range to one or more ranges which contains only normal changes.
    //
    // For each `start` line number, we can either:
    //
    // 1. Find a change and adjust to a nearest normal one.
    // 2. Find no corresponding change so it must be a collapsed normal change.
    //
    // For both cases we can have a starting normal change, then we iterate over its subsequent changes
    // (line numbers with no corresponding change is considered a normal one)
    // until an insert or delete is encountered, this is a **valid range**.
    //
    // After one valid range is resolved, discard all line numbers related to delete changes, the next normal change
    // is the start of next valid range.
    const validRanges = splitRangeToValidOnes(hunks, start, end);

    return validRanges.reduce((hunks, range) => expandCodeByValidRange(hunks, rawCodeOrLines, range), hunks);
};

export const getCollapsedLinesCountBetween = (previousHunk, nextHunk) => {
    if (!previousHunk) {
        return nextHunk.oldStart - 1;
    }

    if (!nextHunk) {
        throw new Error('Unable to compute lines count after the last hunk');
    }

    const previousEnd = previousHunk.oldStart + previousHunk.oldLines;
    const nextStart = nextHunk.oldStart;

    return nextStart - previousEnd;
};

export const expandCollapsedBlockBy = (hunks, rawCodeOrLines, predicate) => {
    const linesOfCode = typeof rawCodeOrLines === 'string' ? rawCodeOrLines.split('\n') : rawCodeOrLines;
    const firstHunk = first(hunks);
    const initialExpandingBlocks = predicate(firstHunk.oldStart - 1, 1, 1) ? [[1, firstHunk.oldStart]] : [];

    const expandingBlocks = hunks.reduce(
        (expandingBlocks, currentHunk, index, hunks) => {
            const nextHunk = hunks[index + 1];
            const oldStart = currentHunk.oldStart + currentHunk.oldLines;
            const newStart = currentHunk.newStart + currentHunk.newLines;
            const lines = nextHunk
                ? getCollapsedLinesCountBetween(currentHunk, nextHunk)
                : linesOfCode.length - oldStart + 1;
            const shouldExpand = predicate(lines, oldStart, newStart);

            if (shouldExpand) {
                // initialExpandingBlocks is scoped, it is redundant to copy the array
                expandingBlocks.push([oldStart, oldStart + lines]);
            }
            return expandingBlocks;
        },
        initialExpandingBlocks
    );

    return expandingBlocks.reduce((hunks, [start, end]) => expandFromRawCode(hunks, linesOfCode, start, end), hunks);
};
