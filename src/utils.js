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

const last = array => array[array.length - 1];

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
        content: `@@ -${oldStartLineNumber},${changeLength} +${newStartLineNumber},${changeLength}`,
        oldStart: oldStartLineNumber,
        oldLines: changeLength,
        newStart: newStartLineNumber,
        newLines: changeLength,
        changes: changes
    };
};

const appendOrMergeHunk = (hunks, nextHunk) => {
    const lastHunk = last(hunks);

    if (!lastHunk) {
        return [nextHunk];
    }

    const previousChange = last(lastHunk.changes);
    const nextChange = nextHunk.changes[0];

    if (!previousChange || !nextChange) {
        return hunks.concat(nextHunk);
    }

    if (computeOldLineNumber(previousChange) + 1 !== computeOldLineNumber(nextChange)) {
        return hunks.concat(nextHunk);
    }

    const mergedHunk = {
        ...lastHunk,
        oldLines: lastHunk.oldLines + nextHunk.oldLines,
        newLines: lastHunk.newLines + nextHunk.newLines,
        changes: [...lastHunk.changes, ...nextHunk.changes]
    };

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
