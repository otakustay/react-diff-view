import parse from 'parse-diff';

const computeFileType = ({from, to}) => {
    if (from === '/dev/null') {
        return 'add';
    }

    if (to === '/dev/null') {
        return 'delete';
    }

    return 'modify';
};

const zipChanges = changes => {
    const [result] = changes.reduce(
        ([result, last, lastDeletionIndex], current, i) => {
            if (!last) {
                result.push(current);
                return [result, current, current.del ? i : -1];
            }

            if (current.add && lastDeletionIndex >= 0) {
                result.splice(lastDeletionIndex + 1, 0, current);
                // The new `lastDeletionIndex` may be out of range, but `splice` will fix it
                return [result, current, lastDeletionIndex + 2];
            }

            result.push(current);
            // Keep the `lastDeletionIndex` if there are lines of deletions,
            // otherwise update it to the new deletion line
            const newLastDeletionIndex = current.del
                ? (last.del ? lastDeletionIndex : i)
                : lastDeletionIndex;
            return [result, current, newLastDeletionIndex];
        },
        [[], null, -1]
    );
    return result;
};

const mapChange = ({add, normal, ln1, ln2, ln, content}) => {
    if (normal) {
        return {
            type: 'normal',
            isNormal: true,
            oldLineNumber: ln1,
            newLineNumber: ln2,
            content: content
        };
    }

    if (add) {
        return {
            type: 'insert',
            isInsert: true,
            lineNumber: ln,
            content: content
        };
    }

    return {
        type: 'delete',
        isDelete: true,
        lineNumber: ln,
        content: content
    };
};

const mapHunk = (hunk, options) => {
    const changes = options.nearbySequences === 'zip' ? zipChanges(hunk.changes) : hunk.changes;

    return {
        ...hunk,
        changes: changes.map(mapChange)
    };
};

const mapFile = (file, options) => {
    const hunks = file.chunks.map(hunk => mapHunk(hunk, options));

    return {
        type: computeFileType(file),
        oldPath: file.from,
        newPath: file.to,
        additions: file.additions,
        deletions: file.deletions,
        hunks: options.stubHunk ? addStubHunk(hunks) : hunks
    };
};


// TODO: Implement a faster diff parser
export const parseDiff = (text, options) => {
    const files = parse(text);

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

export const computePrevLineNumber = ({isNormal, lineNumber, oldLineNumber}) => (isNormal ? oldLineNumber : lineNumber);

export const computeNextLineNumber = ({isNormal, lineNumber, newLineNumber}) => (isNormal ? newLineNumber : lineNumber);

const last = array => array[array.length - 1];

export const textLinesToHunk = (lines, prevStartLineNumber, nextStartLineNumber) => {
    const changes = lines.reduce(
        (changes, line, i) => {
            const change = {
                type: 'normal',
                isNormal: true,
                oldLineNumber: prevStartLineNumber + i,
                newLineNumber: nextStartLineNumber + i,
                content: ' ' + line
            };
            changes.push(change);
            return changes;
        },
        []
    );
    const changeLength = changes.length;

    return {
        content: `@@ -${prevStartLineNumber},${changeLength} +${nextStartLineNumber},${changeLength}`,
        oldStart: prevStartLineNumber,
        oldLines: changeLength,
        newStart: nextStartLineNumber,
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

    if (computePrevLineNumber(previousChange) + 1 !== computePrevLineNumber(nextChange)) {
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
