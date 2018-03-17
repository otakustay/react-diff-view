import leven from 'leven';
import {diffChars, diffWordsWithSpace} from 'diff';
import findLastIndex from 'lodash.findlastindex';

const first = array => array[0];

const last = array => array[array.length - 1];

export const computeOldLineNumber = ({isNormal, isInsert, lineNumber, oldLineNumber}) => {
    if (isInsert) {
        return -1;
    }

    return isNormal ? oldLineNumber : lineNumber;
};

export const computeNewLineNumber = ({isNormal, isDelete, lineNumber, newLineNumber}) => {
    if (isDelete) {
        return -1;
    }

    return isNormal ? newLineNumber : lineNumber;
};

const getOldRangeFromHunk = ({oldStart, oldLines}) => [oldStart, oldStart + oldLines - 1];

const createHunkFromChanges = changes => {
    if (!changes.length) {
        return null;
    }

    const initial = {
        isPlain: true,
        content: '',
        oldStart: -1,
        oldLines: 0,
        newStart: -1,
        newLines: 0
    };
    /* eslint-disable no-param-reassign */
    const hunk = changes.reduce(
        (hunk, change) => {
            if (!change.isNormal) {
                hunk.isPlain = false;
            }

            if (!change.isInsert) {
                hunk.oldLines = hunk.oldLines + 1;

                if (hunk.oldStart === -1) {
                    hunk.oldStart = computeOldLineNumber(change);
                }
            }

            if (!change.isDelete) {
                hunk.newLines = hunk.newLines + 1;

                if (hunk.newStart === -1) {
                    hunk.newStart = computeNewLineNumber(change);
                }
            }

            return hunk;
        },
        initial
    );
    /* eslint-enable no-param-reassign */
    const {oldStart, oldLines, newStart, newLines} = hunk;

    return {
        ...hunk,
        content: `@@ -${oldStart},${oldLines} +${newStart},${newLines}`,
        changes: changes
    };
};

export const textLinesToHunk = (lines, oldStartLineNumber, newStartLineNumber) => {
    const lineToChange = (line, i) => {
        return {
            type: 'normal',
            isNormal: true,
            oldLineNumber: oldStartLineNumber + i,
            newLineNumber: newStartLineNumber + i,
            content: '' + line
        };
    };
    const changes = lines.map(lineToChange);

    return createHunkFromChanges(changes);
};

const createIsInHunkFunction = (startProperty, linesProperty) => (hunk, lineNumber) => {
    const start = hunk[startProperty];
    const end = start + hunk[linesProperty];

    return lineNumber >= start && lineNumber < end;
};

const isOldLineNumberInHunk = createIsInHunkFunction('oldStart', 'oldLines');

const createIsBetweenHunksFunction = (startProperty, linesProperty) => (previousHunk, nextHunk, lineNumber) => {
    const start = previousHunk[startProperty] + previousHunk[linesProperty];
    const end = nextHunk[startProperty];

    return lineNumber >= start && lineNumber < end;
};

const isOldLineNumberBetweenHunks = createIsBetweenHunksFunction('oldStart', 'oldLines');

const createFindContainerHunkFunction = side => {
    const startProperty = side + 'Start';
    const linesProperty = side + 'Lines';
    const isInHunk = createIsInHunkFunction(startProperty, linesProperty);

    return (hunks, lineNumber) => hunks.find(hunk => isInHunk(hunk, lineNumber));
};

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

/* eslint-disable consistent-return */
const createFindChangeByLineNumberFunction = side => {
    const computeLineNumber = side === 'old' ? computeOldLineNumber : computeNewLineNumber;
    const findContainerHunk = createFindContainerHunkFunction(side);

    return (hunks, lineNumber) => {
        const containerHunk = findContainerHunk(hunks, lineNumber);

        if (!containerHunk) {
            return undefined;
        }

        return containerHunk.changes.find(change => computeLineNumber(change) === lineNumber);
    };
};
/* eslint-enable consistent-return */

export const findChangeByOldLineNumber = createFindChangeByLineNumberFunction('old');

export const findChangeByNewLineNumber = createFindChangeByLineNumberFunction('new');

const createCorrespondingLineNumberComputeFunction = baseSide => {
    const anotherSide = baseSide === 'old' ? 'new' : 'old';
    const baseStart = baseSide + 'Start';
    const baseLines = baseSide + 'Lines';
    const correspondingStart = anotherSide + 'Start';
    const correspondingLines = anotherSide + 'Lines';
    const baseLineNumber = baseSide === 'old' ? computeOldLineNumber : computeNewLineNumber;
    const correspondingLineNumber = baseSide === 'old' ? computeNewLineNumber : computeOldLineNumber;
    const isInHunk = createIsInHunkFunction(baseStart, baseLines);
    const isBetweenHunks = createIsBetweenHunksFunction(baseStart, baseLines);

    /* eslint-disable complexity */
    return (hunks, lineNumber) => {
        const firstHunk = first(hunks);

        // Before first hunk
        if (lineNumber < firstHunk[baseStart]) {
            const spanFromStart = firstHunk[baseStart] - lineNumber;
            return firstHunk[correspondingStart] - spanFromStart;
        }

        // After last hunk, this can be done in `for` loop, just a quick return path
        const lastHunk = last(hunks);
        if (lastHunk[baseStart] + lastHunk[baseLines] <= lineNumber) {
            const spanFromEnd = lineNumber - lastHunk[baseStart] - lastHunk[baseLines];
            return lastHunk[correspondingStart] + lastHunk[correspondingLines] + spanFromEnd;
        }

        for (let i = 0; i < hunks.length; i++) {
            const currentHunk = hunks[i];
            const nextHunk = hunks[i + 1];

            // Within current hunk
            if (isInHunk(currentHunk, lineNumber)) {
                const changeIndex = currentHunk.changes.findIndex(change => baseLineNumber(change) === lineNumber);
                const change = currentHunk.changes[changeIndex];

                if (change.isNormal) {
                    return correspondingLineNumber(change);
                }

                // For changes of type "insert" and "delete", the sibling change can be the corresponding one,
                // or they can have no corresponding change
                //
                // Git diff always put delete change before insert change
                //
                // Note that `nearbySequences: "zip"` option can affect this function
                const possibleCorrespondingChangeIndex = change.isDelete ? changeIndex + 1 : changeIndex - 1;
                const possibleCorrespondingChange = currentHunk.changes[possibleCorrespondingChangeIndex];

                if (!possibleCorrespondingChange) {
                    return -1;
                }

                const negativeChangeType = change.isInsert ? 'delete' : 'insert';

                return possibleCorrespondingChange.type === negativeChangeType
                    ? correspondingLineNumber(possibleCorrespondingChange)
                    : -1;
            }

            // Between 2 hunks
            if (isBetweenHunks(currentHunk, nextHunk, lineNumber)) {
                const spanFromEnd = lineNumber - currentHunk[baseStart] - currentHunk[baseLines];
                return currentHunk[correspondingStart] + currentHunk[correspondingLines] + spanFromEnd;
            }
        }

        throw new Error(`Unexpected line position ${lineNumber}`);
    };
    /* eslint-enable complexity */
};

export const getCorrespondingOldLineNumber = createCorrespondingLineNumberComputeFunction('new');

export const getCorrespondingNewLineNumber = createCorrespondingLineNumberComputeFunction('old');

const sliceHunk = ({changes}, startOldLineNumber, endOldLineNumber) => {
    const changeIndex = changes.findIndex(change => computeOldLineNumber(change) >= startOldLineNumber);

    if (changeIndex === -1) {
        return null;
    }

    // It is possible to have some insert changes before `startOldLineNumber`,
    // since we slice from old line number, these changes can be ommited, so we need to grab them back
    const startIndex = (() => {
        if (changeIndex === 0) {
            return changeIndex;
        }

        const nearestHeadingNocmalChangeIndex = findLastIndex(changes, change => !change.isInsert, changeIndex - 1);
        return nearestHeadingNocmalChangeIndex === -1 ? changeIndex : nearestHeadingNocmalChangeIndex + 1;
    })();

    if (endOldLineNumber === undefined) {
        const slicedChanges = changes.slice(startIndex);

        return createHunkFromChanges(slicedChanges);
    }

    const endIndex = findLastIndex(changes, change => computeOldLineNumber(change) <= endOldLineNumber);
    const slicedChanges = changes.slice(startIndex, endIndex === -1 ? undefined : endIndex);

    return createHunkFromChanges(slicedChanges);
};

const mergeHunk = (previousHunk, nextHunk) => {
    if (!previousHunk) {
        return nextHunk;
    }

    if (!nextHunk) {
        return previousHunk;
    }

    const [previousStart, previousEnd] = getOldRangeFromHunk(previousHunk);
    const [nextStart, nextEnd] = getOldRangeFromHunk(nextHunk);

    // They are just neighboring, simply concat changes and adjust lines count
    if (previousEnd + 1 === nextStart) {
        return createHunkFromChanges([...previousHunk.changes, ...nextHunk.changes]);
    }

    // It is possible that `previousHunk` entirely **contains** `nextHunk`,
    // and if we are merging a fake hunk with a valid hunk, we need to replace `nextHunk`'s corresponding range
    if (previousStart <= nextStart && previousEnd >= nextEnd) {
        if (previousHunk.isPlain && !nextHunk.isPlain) {
            const head = sliceHunk(previousHunk, previousStart, nextStart);
            const tail = sliceHunk(previousHunk, nextEnd + 1);
            return mergeHunk(mergeHunk(head, nextHunk), tail);
        }

        return previousHunk;
    }

    // The 2 hunks have some overlapping, we need to slice the fake one in order to preserve non-normal changes
    if (previousHunk.isPlain) {
        const head = sliceHunk(previousHunk, previousStart, nextStart);
        return mergeHunk(head, nextHunk);
    }

    const tail = sliceHunk(nextHunk, previousEnd + 1);
    return mergeHunk(previousHunk, tail);
};

const appendOrMergeHunk = (hunks, nextHunk) => {
    const lastHunk = last(hunks);

    if (!lastHunk) {
        return [nextHunk];
    }

    const expectedNextStart = lastHunk.oldStart + lastHunk.oldLines;
    const actualNextStart = nextHunk.oldStart;

    if (expectedNextStart < actualNextStart) {
        return hunks.concat(nextHunk);
    }

    const mergedHunk = mergeHunk(lastHunk, nextHunk);

    return [...hunks.slice(0, -1), mergedHunk];
};

export const insertHunk = (hunks, insertion) => {
    const insertionOldLineNumber = computeOldLineNumber(insertion.changes[0]);
    const isLaterThanInsertion = ({changes}) => {
        if (!changes.length) {
            return false;
        }

        return computeOldLineNumber(changes[0]) >= insertionOldLineNumber;
    };
    const insertPosition = hunks.findIndex(isLaterThanInsertion);
    const hunksWithInsertion = insertPosition === -1
        ? hunks.concat(insertion)
        : [
            ...hunks.slice(0, insertPosition),
            insertion,
            ...hunks.slice(insertPosition)
        ];

    return hunksWithInsertion.reduce(appendOrMergeHunk, []);
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
            ...splitRangeToValidOnes(hunks, validEnd + 1, end)
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
        ...splitRangeToValidOnes(hunks, validEnd + 1, end)
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

            return shouldExpand ? [...expandingBlocks, [oldStart, oldStart + lines]] : expandingBlocks;
        },
        initialExpandingBlocks
    );

    return expandingBlocks.reduce((hunks, [start, end]) => expandFromRawCode(hunks, linesOfCode, start, end), hunks);
};

export const getChangeKey = change => {
    if (!change) {
        throw new Error('change is not provided');
    }

    const {isNormal, isInsert, lineNumber, oldLineNumber} = change;

    if (isNormal) {
        return 'N' + oldLineNumber;
    }

    const prefix = isInsert ? 'I' : 'D';
    return prefix + lineNumber;
};

const NO_EDITS = [[], []];

const markEditsBy = computeDiff => (options = {}) => {
    const {threshold = Infinity, markLongDistanceDiff = false} = options;

    return (oldChange, newChange) => {
        if (!oldChange || !newChange) {
            return NO_EDITS;
        }

        const oldContent = oldChange.content;
        const newContent = newChange.content;

        // Precheck `threshold !== Infinity` to reduce calls to `leven`
        if (threshold !== Infinity && leven(oldContent, newContent) > threshold) {
            // Mark the whole line as an edit to highlight "this line is completely changed"
            if (markLongDistanceDiff) {
                return [
                    [[0, oldContent.length]],
                    [[0, newContent.length]]
                ];
            }

            return NO_EDITS;
        }

        const diff = computeDiff(oldContent, newContent);
        /* eslint-disable no-param-reassign */
        const {aEdits, bEdits} = diff.reduce(
            (result, {added, removed, value}) => {
                if (!added && !removed) {
                    result.aIndex += value.length;
                    result.bIndex += value.length;

                    return result;
                }

                if (added) {
                    result.bEdits.push([result.bIndex, value.length]);
                    result.bIndex += value.length;

                    return result;
                }

                result.aEdits.push([result.aIndex, value.length]);
                result.aIndex += value.length;

                return result;
            },
            {aEdits: [], bEdits: [], aIndex: 0, bIndex: 0}
        );
        /* eslint-enable no-param-reassign */

        return [aEdits, bEdits];
    };
};

export const markWordEdits = markEditsBy(diffWordsWithSpace);

export const markCharacterEdits = markEditsBy(diffChars);
