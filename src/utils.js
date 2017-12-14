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

const isInHunk = (hunk, oldLineNumber) => {
    const start = hunk.oldStart;
    const end = hunk.oldStart + hunk.oldLines;

    return oldLineNumber >= start && oldLineNumber <= end;
};

const isBetweenHunks = (previousHunk, nextHunk, oldLineNumber) => {
    const start = previousHunk.oldStart + previousHunk.oldLines;

    if (!nextHunk) {
        return oldLineNumber > start;
    }

    const end = nextHunk.oldStart;

    return oldLineNumber > start  && oldLineNumber < end;
};

const getCorrespondingNewLineNumber = (hunks, oldLineNumber) => {
    const firstHunk = first(hunks);

    // Before first hunk
    if (oldLineNumber < firstHunk.oldStart) {
        const spanFromStart = firstHunk.oldStart - oldLineNumber;
        return firstHunk.newStart - spanFromStart;
    }

    // After last hunk, this can be done in `for` loop, just a quick return path
    const lastHunk = last(hunks);
    if (lastHunk.oldStart + lastHunk.oldLines <= oldLineNumber) {
        const spanFromEnd = oldLineNumber - lastHunk.oldStart - lastHunk.oldLines;
        return lastHunk.newStart + lastHunk.newLines + spanFromEnd;
    }

    for (let i = 0; i < hunks.length; i++) {
        const currentHunk = hunks[i];
        const nextHunk = hunks[i + 1];

        // Within current hunk or between 2 hunks
        if (isInHunk(currentHunk, oldLineNumber) || isBetweenHunks(currentHunk, nextHunk, oldLineNumber)) {
            const spanFromEnd = oldLineNumber - currentHunk.oldStart - currentHunk.oldLines;
            return currentHunk.newStart + currentHunk.newLines + spanFromEnd;
        }
    }

    throw new Error(`Unexpected line position ${oldLineNumber}`);
};

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
