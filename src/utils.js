import parse from 'parse-diff';

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


// TODO: Implement a faster diff parser
// TODO: Document `options`
export const parseDiff = (text, options) => {
    const files = parse(text);

    if (!options) {
        return files;
    }

    const {nearbySequences = null, stubChunk = false} = options;

    // since `files` is a local variable and will never be accessed out of this scope,
    // here we mutate it directly to add extra adjustment
    for (const file of files) {
        const chunks = stubChunk ? addStubChunk(file.chunks) : file.chunks;

        if (nearbySequences === 'zip') {
            for (const chunk of chunks) {
                chunk.changes = zipChanges(chunk.changes);
            }
        }

        file.chunks = chunks;
    }

    return files;
};

export const addStubChunk = chunks => {
    if (!chunks || !chunks.length) {
        return chunks;
    }

    const {oldStart, oldLines, newStart, newLines} = chunks[chunks.length - 1];
    const stubChunk = {
        oldStart: oldStart + oldLines,
        oldLines: 0,
        newStart: newStart + newLines,
        newLines: 0,
        content: 'STUB',
        changes: []
    };
    return [...chunks, stubChunk];
};

export const computePrevLineNumber = ({normal, ln, ln1}) => (normal ? ln1 : ln);

export const computeNextLineNumber = ({normal, ln, ln2}) => (normal ? ln2 : ln);

const last = array => array[array.length - 1];

export const textLinesToChunk = (lines, prevStartLineNumber, nextStartLineNumber) => {
    const changes = lines.reduce(
        (changes, line, i) => {
            const change = {
                type: 'normal',
                normal: true,
                ln1: prevStartLineNumber + i,
                ln2: nextStartLineNumber + i,
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

const tryMergeChunks = (x, y) => {
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

export const insertChunk = (chunks, insertion) => chunks.reduce(
    (chunks, current) => {
        const mergedChunk = tryMergeChunks(current, insertion) || tryMergeChunks(insertion, current);
        chunks.push(mergedChunk || current);
        return chunks;
    },
    []
);
