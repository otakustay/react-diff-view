import {flatMap, keyBy} from 'lodash';
import type {AST, RefractorNode, highlight} from 'refractor';
import {Side} from '../interface';
import {computeOldLineNumber, computeNewLineNumber, ChangeData, HunkData, isDelete, isInsert, isNormal} from '../utils';
import {Pair, TokenNode} from './interface';

interface Refractor {
    highlight: typeof highlight;
}

interface HunkApplyState {
    newStart: number;
    changes: ChangeData[];
}

// This function mutates `linesOfCode` argument.
function applyHunk(linesOfCode: string[], {newStart, changes}: HunkApplyState) {
    // Within each hunk, changes are continous, so we can use a sequential algorithm here.
    //
    // When `linesOfCode` is received here, it has already patched by previous hunk,
    // thus the starting line number has changed due to possible unbanlanced deletions and insertions,
    // we should use `newStart` as the first line number of current reduce.
    const [patchedLines] = changes.reduce<[string[], number]>(
        ([lines, cursor], change) => {
            if (isDelete(change)) {
                lines.splice(cursor, 1);
                return [lines, cursor];
            }

            if (isInsert(change)) {
                lines.splice(cursor, 0, change.content);
            }
            return [lines, cursor + 1];
        },
        [linesOfCode, newStart - 1]
    );

    return patchedLines;
}

function applyDiff(oldSource: string, hunks: HunkData[]): string {
    // `hunks` must be ordered here.
    const patchedLines = hunks.reduce(applyHunk, oldSource.split('\n'));
    return patchedLines.join('\n');
}

function mapChanges<T>(changes: ChangeData[], side: Side, toValue: (change: ChangeData | undefined) => T): T[] {
    if (!changes.length) {
        return [];
    }

    const computeLineNumber = side === 'old' ? computeOldLineNumber : computeNewLineNumber;
    const changesByLineNumber = keyBy(changes, computeLineNumber);
    const maxLineNumber = computeLineNumber(changes[changes.length - 1]);
    // TODO: why don't we start from the first change's line number?
    return Array.from({length: maxLineNumber}).map((value, i) => toValue(changesByLineNumber[i + 1]));
}

function groupChanges(hunks: HunkData[]): Pair<ChangeData[]> {
    const changes = flatMap(hunks, hunk => hunk.changes);
    return changes.reduce<[ChangeData[], ChangeData[]]>(
        ([oldChanges, newChanges], change) => {
            if (isNormal(change)) {
                oldChanges.push(change);
                newChanges.push(change);
            }
            else if (isDelete(change)) {
                oldChanges.push(change);
            }
            else {
                newChanges.push(change);
            }

            return [oldChanges, newChanges];
        },
        [[], []]
    );
}

function toTextPair(hunks: HunkData[]): Pair<string> {
    const [oldChanges, newChanges] = groupChanges(hunks);
    const toText = (change: ChangeData | undefined) => (change ? change.content : '');
    const oldText = mapChanges(oldChanges, 'old', toText).join('\n');
    const newText = mapChanges(newChanges, 'new', toText).join('\n');
    return [oldText, newText];
}

function createRoot(children: RefractorNode[]): TokenNode {
    return {type: 'root', children: children};
}

export interface ToTokenTreeOptionsNoHighlight {
    highlight?: false;
    oldSource?: string;
}

export interface ToTokenTreeOptionsHighlight {
    highlight: true;
    refractor: Refractor;
    oldSource?: string;
    language: string;
}

export type ToTokenTreeOptions = ToTokenTreeOptionsNoHighlight | ToTokenTreeOptionsHighlight;

export default function toTokenTrees(hunks: HunkData[], options: ToTokenTreeOptions): Pair<TokenNode> {
    if (options.oldSource) {
        const newSource = applyDiff(options.oldSource, hunks);
        const highlightText = options.highlight
            ? (text: string) => options.refractor.highlight(text, options.language)
            : (text: string): AST.Text[] => [{type: 'text', value: text}];

        return [
            createRoot(highlightText(options.oldSource)),
            createRoot(highlightText(newSource)),
        ];
    }

    const [oldText, newText] = toTextPair(hunks);
    const toTree = options.highlight
        ? (text: string) => createRoot(options.refractor.highlight(text, options.language))
        : (text: string) => createRoot([{type: 'text', value: text}]);

    return [toTree(oldText), toTree(newText)];
}
