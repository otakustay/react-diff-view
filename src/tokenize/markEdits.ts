import {findIndex, flatMap, flatten} from 'lodash';
import DiffMatchPatch, {Diff} from 'diff-match-patch';
import {ChangeData, HunkData, isDelete, isInsert, isNormal} from '../utils';
import pickRanges, {RangeTokenNode} from './pickRanges';
import {TokenizeEnhancer} from './interface';

const {DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT} = DiffMatchPatch;

function findChangeBlocks(changes: ChangeData[]): ChangeData[][] {
    const start = findIndex(changes, change => !isNormal(change));

    if (start === -1) {
        return [];
    }

    const end = findIndex(changes, change => !!isNormal(change), start);

    if (end === -1) {
        return [changes.slice(start)];
    }

    return [
        changes.slice(start, end),
        ...findChangeBlocks(changes.slice(end)),
    ];
}

function groupDiffs(diffs: Diff[]): [Diff[], Diff[]] {
    return diffs.reduce<[Diff[], Diff[]]>(
        ([oldDiffs, newDiffs], diff) => {
            const [type] = diff;

            switch (type) {
                case DIFF_INSERT:
                    newDiffs.push(diff);
                    break;
                case DIFF_DELETE:
                    oldDiffs.push(diff);
                    break;
                default:
                    oldDiffs.push(diff);
                    newDiffs.push(diff);
                    break;
            }

            return [oldDiffs, newDiffs];
        },
        [[], []]
    );
}

function splitDiffToLines(diffs: Diff[]): Diff[][] {
    return diffs.reduce<Diff[][]>(
        (lines, [type, value]) => {
            const currentLines = value.split('\n');

            const [currentLineRemaining, ...nextLines] = currentLines.map((line: string): Diff => [type, line]);
            const next = [
                ...lines.slice(0, -1),
                [...lines[lines.length - 1], currentLineRemaining],
                ...nextLines.map(line => [line]),
            ];
            return next;
        },
        [[]]
    );
}

function diffsToEdits(diffs: Diff[], lineNumber: number): RangeTokenNode[] {
    const output = diffs.reduce<[RangeTokenNode[], number]>(
        (output, diff) => {
            const [edits, start] = output;
            const [type, value] = diff;
            if (type !== DIFF_EQUAL) {
                const edit: RangeTokenNode = {
                    type: 'edit',
                    lineNumber: lineNumber,
                    start: start,
                    length: value.length,
                };
                edits.push(edit);
            }

            return [edits, start + value.length];
        },
        [[], 0]
    );

    return output[0];
}

function convertToLinesOfEdits(linesOfDiffs: Diff[][], startLineNumber: number) {
    return flatMap(linesOfDiffs, (diffs, i) => diffsToEdits(diffs, startLineNumber + i));
}

function diffText(x: string, y: string): [Diff[], Diff[]] {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(x, y);
    dmp.diff_cleanupSemantic(diffs);

    // for only one diff, it's a insertion or deletion, we won't mark it in UI
    if (diffs.length <= 1) {
        return [[], []];
    }

    return groupDiffs(diffs);
}

function diffChangeBlock(changes: ChangeData[]): [RangeTokenNode[], RangeTokenNode[]] {
    const [oldSource, newSource] = changes.reduce(
        ([oldSource, newSource], change) => (
            isDelete(change)
                ? [oldSource + (oldSource ? '\n' : '') + change.content, newSource]
                : [oldSource, newSource + (newSource ? '\n' : '') + change.content]
        ),
        ['', '']
    );

    const [oldDiffs, newDiffs] = diffText(oldSource, newSource);

    if (oldDiffs.length === 0 && newDiffs.length === 0) {
        return [[], []];
    }

    const getLineNumber = (change: ChangeData | undefined) => {
        if (!change || isNormal(change)) {
            return undefined;
        }

        return change.lineNumber;
    };
    const oldStartLineNumber = getLineNumber(changes.find(isDelete));
    const newStartLineNumber = getLineNumber(changes.find(isInsert));

    if (oldStartLineNumber === undefined || newStartLineNumber === undefined) {
        throw new Error('Could not find start line number for edit');
    }

    const oldEdits = convertToLinesOfEdits(splitDiffToLines(oldDiffs), oldStartLineNumber);
    const newEdits = convertToLinesOfEdits(splitDiffToLines(newDiffs), newStartLineNumber);

    return [oldEdits, newEdits];
}

function diffByLine(changes: ChangeData[]): [RangeTokenNode[], RangeTokenNode[]] {
    const [oldEdits, newEdits] = changes.reduce<[RangeTokenNode[], RangeTokenNode[], ChangeData | null]>(
        ([oldEdits, newEdits, previousChange], currentChange) => {
            if (!previousChange || !isDelete(previousChange) || !isInsert(currentChange)) {
                return [oldEdits, newEdits, currentChange];
            }

            const [oldDiffs, newDiffs] = diffText(previousChange.content, currentChange.content);
            return [
                oldEdits.concat(diffsToEdits(oldDiffs, previousChange.lineNumber)),
                newEdits.concat(diffsToEdits(newDiffs, currentChange.lineNumber)),
                currentChange,
            ];
        },
        [[], [], null]
    );
    return [oldEdits, newEdits];
}

export type MarkEditsType = 'block' | 'line';

export interface MarkEditsOptions {
    type?: MarkEditsType;
}

export default function markEdits(hunks: HunkData[], {type = 'block'}: MarkEditsOptions = {}): TokenizeEnhancer {
    const changeBlocks = flatMap(hunks.map(hunk => hunk.changes), findChangeBlocks);
    const findEdits = type === 'block' ? diffChangeBlock : diffByLine;

    const [oldEdits, newEdits] = changeBlocks.map(findEdits).reduce(
        ([oldEdits, newEdits], [currentOld, currentNew]) => [
            oldEdits.concat(currentOld),
            newEdits.concat(currentNew),
        ],
        [[], []]
    );

    return pickRanges(flatten(oldEdits), flatten(newEdits));
}
