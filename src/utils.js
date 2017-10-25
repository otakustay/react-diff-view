// import parse from 'parse-diff';
import leven from 'leven';
import {diffChars, diffWordsWithSpace} from 'diff';
import parser from 'gitdiff-parser';

const zipChanges = changes => {
    const [result] = changes.reduce(
        ([result, last, lastDeletionIndex], current, i) => {
            if (!last) {
                result.push(current);
                return [result, current, current.isDelete ? i : -1];
            }

            if (current.isInsert && lastDeletionIndex >= 0) {
                result.splice(lastDeletionIndex + 1, 0, current);
                // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
                return [result, current, lastDeletionIndex + 2];
            }

            result.push(current);
            // Keep the `lastDeletionIndex` if there are lines of deletions,
            // otherwise update it to the new deletion line
            const newLastDeletionIndex = current.isDelete
                ? (last.isDelete ? lastDeletionIndex : i)
                : lastDeletionIndex;
            return [result, current, newLastDeletionIndex];
        },
        [[], null, -1]
    );
    return result;
};

const mapHunk = (hunk, options) => {
    const changes = options.nearbySequences === 'zip' ? zipChanges(hunk.changes) : hunk.changes;

    return {
        ...hunk,
        changes: changes
    };
};

const mapFile = (file, options) => {
    const hunks = file.hunks.map(hunk => mapHunk(hunk, options));

    return {
        ...file,
        hunks: options.stubHunk ? addStubHunk(hunks) : hunks
    };
};


export const parseDiff = (text, options = {}) => {
    const files = parser.parse(text);

    return files.map(file => mapFile(file, options));
};

export const addStubHunk = hunks => {
    if (!hunks || !hunks.length) {
        return hunks;
    }

    const {oldStart, oldLines, newStart, newLines} = hunks[hunks.length - 1];
    const stubHunk = {
        oldStart: oldStart + oldLines,
        oldLines: 0,
        newStart: newStart + newLines,
        newLines: 0,
        content: 'STUB',
        changes: []
    };
    return [...hunks, stubHunk];
};

export const computeOldLineNumber = ({isNormal, lineNumber, oldLineNumber}) => (isNormal ? oldLineNumber : lineNumber);

export const computeNewLineNumber = ({isNormal, lineNumber, newLineNumber}) => (isNormal ? newLineNumber : lineNumber);

const last = array => array[array.length - 1];

export const textLinesToHunk = (lines, oldStartLineNumber, newStartLineNumber) => {
    const changes = lines.reduce(
        (changes, line, i) => {
            const change = {
                type: 'normal',
                isNormal: true,
                oldLineNumber: oldStartLineNumber + i,
                newLineNumber: newStartLineNumber + i,
                content: ' ' + line
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

const tryMergeHunks = (x, y) => {
    if (!x || !y) {
        return null;
    }

    const previousChange = last(x.changes);
    const nextChange = y.changes[0];

    if (!previousChange || !nextChange) {
        return null;
    }

    if (computeOldLineNumber(previousChange) + 1 !== computeOldLineNumber(nextChange)) {
        return null;
    }

    return {
        ...x,
        changes: [...x.changes, ...y.changes]
    };
};

export const insertHunk = (hunks, insertion) => hunks.reduce(
    (hunks, current) => {
        const mergedHunk = tryMergeHunks(current, insertion) || tryMergeHunks(insertion, current);
        hunks.push(mergedHunk || current);
        return hunks;
    },
    []
);

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
