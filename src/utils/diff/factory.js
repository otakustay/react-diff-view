import {first, last, sideToProperty} from './util';

export const computeLineNumberFactory = side => {
    if (side === 'old') {
        return ({isNormal, isInsert, lineNumber, oldLineNumber}) => {
            if (isInsert) {
                return -1;
            }

            return isNormal ? oldLineNumber : lineNumber;
        };
    }
    return ({isNormal, isDelete, lineNumber, newLineNumber}) => {
        if (isDelete) {
            return -1;
        }

        return isNormal ? newLineNumber : lineNumber;
    };
};

export const isInHunkFactory = (startProperty, linesProperty) => (hunk, lineNumber) => {
    const start = hunk[startProperty];
    const end = start + hunk[linesProperty];

    return lineNumber >= start && lineNumber < end;
};

export const isBetweenHunksFactory = (startProperty, linesProperty) => (previousHunk, nextHunk, lineNumber) => {
    const start = previousHunk[startProperty] + previousHunk[linesProperty];
    const end = nextHunk[startProperty];

    return lineNumber >= start && lineNumber < end;
};

const findContainerHunkFactory = side => {
    const [startProperty, linesProperty] = sideToProperty(side);
    const isInHunk = isInHunkFactory(startProperty, linesProperty);

    return (hunks, lineNumber) => hunks.find(hunk => isInHunk(hunk, lineNumber));
};

/* eslint-disable consistent-return */
export const findChangeByLineNumberFactory = side => {
    const computeLineNumber = computeLineNumberFactory(side);
    const findContainerHunk = findContainerHunkFactory(side);

    return (hunks, lineNumber) => {
        const containerHunk = findContainerHunk(hunks, lineNumber);

        if (!containerHunk) {
            return undefined;
        }

        return containerHunk.changes.find(change => computeLineNumber(change) === lineNumber);
    };
};
/* eslint-enable consistent-return */

export const getCorrespondingLineNumberFactory = baseSide => {
    const anotherSide = baseSide === 'old' ? 'new' : 'old';
    const [baseStart, baseLines] = sideToProperty(baseSide);
    const [correspondingStart, correspondingLines] = sideToProperty(anotherSide);
    const baseLineNumber = computeLineNumberFactory(baseSide);
    const correspondingLineNumber = computeLineNumberFactory(anotherSide);
    const isInHunk = isInHunkFactory(baseStart, baseLines);
    const isBetweenHunks = isBetweenHunksFactory(baseStart, baseLines);

    /* eslint-disable complexity */
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

        /* istanbul ignore next Should not arrive here */
        throw new Error(`Unexpected line position ${lineNumber}`);
    };
    /* eslint-enable complexity */
};
