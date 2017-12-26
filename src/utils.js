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

const createHunkFromChanges = changes => {
    if (!changes.length) {
        return null;
    }

    const initial = {
        isTextHunk: true,
        content: '',
        oldStart: -1,
        oldLines: 0,
        newStart: -1,
        newLines: 0
    };
    const hunk = changes.reduce(
        (hunk, change) => {
            if (!change.isNormal) {
                hunk.isTextHunk = false;
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

const createIsBetweenHunksFunction = (startProperty, linesProperty) => (previousHunk, nextHunk, lineNumber) => {
    const start = previousHunk[startProperty] + previousHunk[linesProperty];
    const end = nextHunk[startProperty];

    return lineNumber >= start && lineNumber < end;
};

const createFindContainerHunkFunction = side => {
    const startProperty = side + 'Start';
    const linesProperty = side + 'Lines';
    const isInHunk = createIsInHunkFunction(startProperty, linesProperty);

    return (hunks, lineNumber) => hunks.find(hunk => isInHunk(hunk, lineNumber));
};

const findContainerHunkByOldLineNumber = createFindContainerHunkFunction('old');

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
};

export const getCorrespondingOldLineNumber = createCorrespondingLineNumberComputeFunction('new');

export const getCorrespondingNewLineNumber = createCorrespondingLineNumberComputeFunction('old');

const sliceHunk = (hunk, startOldLineNumber, endOldLineNumber) => {
    const startIndex = hunk.changes.findIndex(change => computeOldLineNumber(change) >= startOldLineNumber);

    if (startIndex === -1) {
        return null;
    }

    if (endOldLineNumber === undefined) {
        const slicedChanges = hunk.changes.slice(startIndex);

        return createHunkFromChanges(slicedChanges);
    }

    const endIndex = findLastIndex(hunk.changes, change => computeOldLineNumber(change) <= endOldLineNumber);
    const slicedChanges = hunk.changes.slice(startIndex, endIndex === -1 ? undefined : endIndex);

    return createHunkFromChanges(slicedChanges);
};

const mergeHunk = (previousHunk, nextHunk) => {
    if (!previousHunk) {
        return nextHunk;
    }

    if (!nextHunk) {
        return previousHunk;
    }

    const previousStart = computeOldLineNumber(first(previousHunk.changes));
    const previousEnd = computeOldLineNumber(last(previousHunk.changes));
    const nextStart = computeOldLineNumber(first(nextHunk.changes));
    const nextEnd = computeOldLineNumber(last(nextHunk.changes));

    // They are just neighboring, simply concat changes and adjust lines count
    if (previousEnd + 1 === nextStart) {
        return {
            ...previousHunk,
            oldLines: previousHunk.oldLines + nextHunk.oldLines,
            newLines: previousHunk.newLines + nextHunk.newLines,
            changes: [...previousHunk.changes, ...nextHunk.changes]
        };
    }

    // It is possible that `previousHunk` entirely **contains** `nextHunk`,
    // and if `nextHunk` is not a fake one, we need to replace `nextHunk`'s corresponding range
    if (previousStart <= nextStart && previousEnd >= nextEnd && !nextHunk.isTextHunk) {
        const head = sliceHunk(previousHunk, previousStart, nextStart);
        const tail = sliceHunk(previousHunk, nextEnd + 1);
        return mergeHunk(mergeHunk(head, nextHunk), tail);
    }

    // The 2 hunks have some overlapping, we need to slice the fake one in order to preserve non-normal changes
    if (previousHunk.isTextHunk) {
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
    const insertPosition = hunks.findIndex(hunk => computeOldLineNumber(hunk.changes[0]) >= insertionOldLineNumber);
    const hunksWithInsertion = insertPosition === -1
        ? hunks.concat(insertion)
        : [
            ...hunks.slice(0, insertPosition),
            insertion,
            ...hunks.slice(insertPosition)
        ];

    return hunksWithInsertion.reduce(appendOrMergeHunk, []);
};

const adjustStartToNormalChange = (hunks, start) => {
    const hunk = findContainerHunkByOldLineNumber(hunks, start);

    if (!hunk) {
        return start;
    }

    const {changes} = hunk;
    const index = changes.findIndex(change => computeOldLineNumber(change) === start);

    for (let i = index; i < changes.length; i++) {
        const change = changes[i];

        if (change.isNormal) {
            return computeOldLineNumber(change);
        }
    }

    throw new Error(`There is no nearby normal change after line ${start} in hunks`);
};

export const expandFromRawCode = (hunks, rawCodeOrLines, start, end) => {
    // It is not possible to  slice from a normal change since there is no corresponding new line number.
    //
    // In this case, we need to find the nearest subsequent normal change and start from there.
    //
    // The issue does not apply to `end` because we need only a `newStart` property in hunk object.
    const adjustedStart = adjustStartToNormalChange(hunks, start);

    // Note `end` is not inclusive, this is the same as `Array.prototype.slice` method
    const linesOfCode = typeof rawCodeOrLines === 'string' ? rawCodeOrLines.split('\n') : rawCodeOrLines;
    const slicedLines = linesOfCode.slice(Math.max(adjustedStart, 1) - 1, end - 1);

    if (!slicedLines.length) {
        return hunks;
    }

    const slicedHunk = textLinesToHunk(slicedLines, adjustedStart, getCorrespondingNewLineNumber(hunks, adjustedStart));
    return insertHunk(hunks, slicedHunk);
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

export const getChangeKey = hunk => {
    if (!hunk) {
        throw new Error('hunk is not provided');
    }

    const {isNormal, isInsert, lineNumber, oldLineNumber} = hunk;

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

        return [aEdits, bEdits];
    };
};

export const markWordEdits = markEditsBy(diffWordsWithSpace);

export const markCharacterEdits = markEditsBy(diffChars);
