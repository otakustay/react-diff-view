import {findLastIndex} from 'lodash';
import {ChangeData, HunkData, isDelete, isInsert, isNormal} from '../parse';
import {computeLineNumberFactory} from './factory';
import {last} from './util';

const computeOldLineNumber = computeLineNumberFactory('old');

const computeNewLineNumber = computeLineNumberFactory('new');

function getOldRangeFromHunk({oldStart, oldLines}: HunkData) {
    return [oldStart, oldStart + oldLines - 1];
}

interface HunkMayBePlain extends HunkData {
    isPlain?: boolean;
}

function createHunkFromChanges(changes: ChangeData[]): HunkMayBePlain | null {
    if (!changes.length) {
        return null;
    }

    const initial = {
        isPlain: true,
        content: '',
        oldStart: -1,
        oldLines: 0,
        newStart: -1,
        newLines: 0,
    };
    /* eslint-disable no-param-reassign */
    const hunk = changes.reduce(
        (hunk, change) => {
            if (!isNormal(change)) {
                hunk.isPlain = false;
            }

            if (!isInsert(change)) {
                hunk.oldLines = hunk.oldLines + 1;

                if (hunk.oldStart === -1) {
                    hunk.oldStart = computeOldLineNumber(change);
                }
            }

            if (!isDelete(change)) {
                hunk.newLines = hunk.newLines + 1;

                if (hunk.newStart === -1) {
                    hunk.newStart = computeNewLineNumber(change);
                }
            }

            return hunk;
        },
        initial
    );
    /* eslint-enable no-param-reassign */
    const {oldStart, oldLines, newStart, newLines} = hunk;

    return {
        ...hunk,
        content: `@@ -${oldStart},${oldLines} +${newStart},${newLines}`,
        changes: changes,
    };
}

export function textLinesToHunk(lines: string[], oldStartLine: number, newStartLine: number): HunkData | null {
    const lineToChange = (line: string, i: number): ChangeData => {
        return {
            type: 'normal',
            isNormal: true,
            oldLineNumber: oldStartLine + i,
            newLineNumber: newStartLine + i,
            content: '' + line,
        };
    };
    const changes = lines.map(lineToChange);

    return createHunkFromChanges(changes);
}

function sliceHunk({changes}: HunkData, oldStartLine: number, oldEndLine?: number): HunkMayBePlain | null {
    const changeIndex = changes.findIndex(change => computeOldLineNumber(change) >= oldStartLine);

    if (changeIndex === -1) {
        return null;
    }

    // It is possible to have some insert changes before `startOldLineNumber`,
    // since we slice from old line number, these changes can be ommited, so we need to grab them back
    const startIndex = (() => {
        if (changeIndex === 0) {
            return changeIndex;
        }

        const nearestHeadingNocmalChangeIndex = findLastIndex(changes, change => !isInsert(change), changeIndex - 1);
        return nearestHeadingNocmalChangeIndex === -1 ? changeIndex : nearestHeadingNocmalChangeIndex + 1;
    })();

    if (oldEndLine === undefined) {
        const slicedChanges = changes.slice(startIndex);

        return createHunkFromChanges(slicedChanges);
    }

    const endIndex = findLastIndex(changes, change => computeOldLineNumber(change) <= oldEndLine);
    const slicedChanges = changes.slice(startIndex, endIndex === -1 ? undefined : endIndex);

    return createHunkFromChanges(slicedChanges);
}

function mergeHunk(previousHunk: HunkMayBePlain | null, nextHunk: HunkMayBePlain | null): HunkData | null {
    if (!previousHunk) {
        return nextHunk;
    }

    if (!nextHunk) {
        return previousHunk;
    }

    const [previousStart, previousEnd] = getOldRangeFromHunk(previousHunk);
    const [nextStart, nextEnd] = getOldRangeFromHunk(nextHunk);

    // They are just neighboring, simply concat changes and adjust lines count
    if (previousEnd + 1 === nextStart) {
        return createHunkFromChanges([...previousHunk.changes, ...nextHunk.changes]);
    }

    // It is possible that `previousHunk` entirely **contains** `nextHunk`,
    // and if we are merging a fake hunk with a valid hunk, we need to replace `nextHunk`'s corresponding range
    if (previousStart <= nextStart && previousEnd >= nextEnd) {
        if (previousHunk.isPlain && !nextHunk.isPlain) {
            const head = sliceHunk(previousHunk, previousStart, nextStart);
            const tail = sliceHunk(previousHunk, nextEnd + 1);
            return mergeHunk(mergeHunk(head, nextHunk), tail);
        }

        return previousHunk;
    }

    // The 2 hunks have some overlapping, we need to slice the fake one in order to preserve non-normal changes
    if (previousHunk.isPlain) {
        const head = sliceHunk(previousHunk, previousStart, nextStart);
        return mergeHunk(head, nextHunk);
    }

    const tail = sliceHunk(nextHunk, previousEnd + 1);
    return mergeHunk(previousHunk, tail);
}

function appendOrMergeHunk(hunks: HunkData[], nextHunk: HunkData): HunkData[] {
    const lastHunk = last(hunks);

    if (!lastHunk) {
        return [nextHunk];
    }

    const expectedNextStart = lastHunk.oldStart + lastHunk.oldLines;
    const actualNextStart = nextHunk.oldStart;

    if (expectedNextStart < actualNextStart) {
        return hunks.concat(nextHunk);
    }

    const mergedHunk = mergeHunk(lastHunk, nextHunk);

    return mergedHunk ? [...hunks.slice(0, -1), mergedHunk] : hunks;
}

export function insertHunk(hunks: HunkData[], insertion: HunkData): HunkData[] {
    const insertionOldLineNumber = computeOldLineNumber(insertion.changes[0]);
    const isLaterThanInsertion = ({changes}: HunkData) => {
        if (!changes.length) {
            return false;
        }

        return computeOldLineNumber(changes[0]) >= insertionOldLineNumber;
    };
    const insertPosition = hunks.findIndex(isLaterThanInsertion);
    const hunksWithInsertion = insertPosition === -1
        ? hunks.concat(insertion)
        : [
            ...hunks.slice(0, insertPosition),
            insertion,
            ...hunks.slice(insertPosition),
        ];

    return hunksWithInsertion.reduce(appendOrMergeHunk, []);
}
