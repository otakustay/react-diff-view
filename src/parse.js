import parser from 'gitdiff-parser';
import warning from 'warning';

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
            const newLastDeletionIndex = current.isDelete ? (last.isDelete ? lastDeletionIndex : i) : i;

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
        isPlain: false,
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
    warning(
        !options.stubHunk,
        'stubHunk options is deprecated, use addStubHunk function later to add a stub hunk, '
        + 'this function can receive an extra referenceCodeOrLines argument to determine whether stub hunk is required'
    );

    const files = parser.parse(text);

    return files.map(file => mapFile(file, options));
};

export const addStubHunk = (hunks, referenceCodeOrLines) => {
    if (!hunks || !hunks.length) {
        return hunks;
    }

    const isStubRequired = (() => {
        if (!referenceCodeOrLines) {
            return true;
        }

        const linesOfCode = typeof referenceCodeOrLines === 'string'
            ? referenceCodeOrLines.split('\n')
            : referenceCodeOrLines;
        const lastHunk = hunks[hunks.length - 1];
        const lastLineNumber = lastHunk.oldStart + lastHunk.oldLines - 1;

        return linesOfCode.length > lastLineNumber;
    })();

    if (!isStubRequired) {
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
