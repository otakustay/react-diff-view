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

const normalizeDiffText = text => {
    if (text.indexOf('diff --git') === 0) {
        return text;
    }

    const indexOfFirstLineBreak = text.indexOf('\n');
    const indexOfSecondLineBreak = text.indexOf('\n', indexOfFirstLineBreak + 1);
    const firstLine = text.slice(0, indexOfFirstLineBreak);
    const secondLine = text.slice(indexOfFirstLineBreak + 1, indexOfSecondLineBreak);
    const oldPath = firstLine.slice(4);
    const newPath = secondLine.slice(4);
    const segments = [
        `diff --git ${oldPath} ${newPath}`,
        'index 1111111..2222222 100644',
        text
    ];

    return segments.join('\n');
};

export const parseDiff = (text, options = {}) => {
    warning(
        !options.stubHunk,
        'stubHunk options is deprecated, use addStubHunk function later to add a stub hunk, '
        + 'this function can receive an extra referenceCodeOrLines argument to determine whether stub hunk is required'
    );

    const diffText = normalizeDiffText(text);
    const files = parser.parse(diffText);

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
