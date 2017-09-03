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
                content: line
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
