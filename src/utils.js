import leven from 'leven';
import {diffChars, diffWordsWithSpace} from 'diff';

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

export const textLinesToHunk = (lines, oldStartLineNumber, newStartLineNumber) => {
    const changes = lines.reduce(
        (changes, line, i) => {
            const change = {
                type: 'normal',
                isNormal: true,
                oldLineNumber: oldStartLineNumber + i,
                newLineNumber: newStartLineNumber + i,
                content: '' + line
            };
            changes.push(change);
            return changes;
        },
        []
    );
    const changeLength = changes.length;

    return {
        isTextHunk: true,
        content: `@@ -${oldStartLineNumber},${changeLength} +${newStartLineNumber},${changeLength}`,
        oldStart: oldStartLineNumber,
        oldLines: changeLength,
        newStart: newStartLineNumber,
        newLines: changeLength,
        changes: changes
    };
};

const first = array => array[0];

const last = array => array[array.length - 1];

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

const createFindChangeByLineNumberFunction = side => {
    const computeLineNumber = side === 'old' ? computeOldLineNumber : computeNewLineNumber;
    const startProperty = side + 'Start';
    const linesProperty = side + 'Lines';
    const isInHunk = createIsInHunkFunction(startProperty, linesProperty);

    return (hunks, lineNumber) => {
        const containerHunk = hunks.find(hunk => isInHunk(hunk, lineNumber));

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
    const correspondingLineNumber = baseSide === 'old' ? computeOldLineNumber : computeNewLineNumber;
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
    const isInRange = change => {
        const oldLineNumber = computeOldLineNumber(change);
        return oldLineNumber >= startOldLineNumber
            && (endOldLineNumber === undefined || oldLineNumber < endOldLineNumber);
    };
    const [isTextHunk, slicedChanges] = hunk.changes.reduce(
        ([isTextHunk, changes], change) => {
            if (isInRange(change)) {
                changes.push(change);
            }

            return [isTextHunk && !change.isNormal, changes];
        },
        [true, []]
    );

    const firstChange = first(slicedChanges);
    const oldStart = computeOldLineNumber(firstChange);
    const newStart = computeNewLineNumber(firstChange);
    const lastChange = last(slicedChanges);
    const oldEnd = computeOldLineNumber(lastChange);
    const newEnd = computeNewLineNumber(lastChange);

    return {
        isTextHunk: isTextHunk,
        content: 'SLICED',
        oldStart: oldStart,
        oldLines: oldEnd - oldStart + 1,
        newStart: newStart,
        newLines: newEnd - newStart + 1,
        changes: slicedChanges
    };
};

const mergeHunk = (previousHunk, nextHunk) => {
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

    const previousChange = last(lastHunk.changes);
    const nextChange = first(nextHunk.changes);

    if (!previousChange || !nextChange) {
        return hunks.concat(nextHunk);
    }

    if (computeOldLineNumber(previousChange) + 1 < computeOldLineNumber(nextChange)) {
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

export const expandFromRawCode = (hunks, rawCodeOrLines, start, end) => {
    // Note `end` is not inclusive, this is the same as `Array.prototype.slice` method
    const linesOfCode = typeof rawCodeOrLines === 'string' ? rawCodeOrLines.split('\n') : rawCodeOrLines;
    const slicedLines = linesOfCode.slice(Math.max(start, 1) - 1, end - 1);

    if (!slicedLines.length) {
        return hunks;
    }

    const slicedHunk = textLinesToHunk(slicedLines, start, getCorrespondingNewLineNumber(hunks, start));
    return insertHunk(hunks, slicedHunk);
};

export const getChangeKey = ({isNormal, isInsert, lineNumber, oldLineNumber}) => {
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
