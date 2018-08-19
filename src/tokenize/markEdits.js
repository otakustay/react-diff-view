import {findIndex, flatMap, last, flatten} from 'lodash';
import DiffMatchPatch from 'diff-match-patch';
import pickRanges from './pickRanges';

const {DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT} = DiffMatchPatch;

const findChangeBlocks = changes => {
    const start = findIndex(changes, change => !change.isNormal);

    if (start === -1) {
        return [];
    }

    const end = findIndex(changes, change => change.isNormal, start);

    if (end === -1) {
        return [changes.slice(start)];
    }

    return [
        changes.slice(start, end),
        ...findChangeBlocks(changes.slice(end))
    ];
};

const groupDiffs = diffs => diffs.reduce(
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

const splitDiffToLines = diffs => diffs.reduce(
    (lines, [type, value]) => {
        const currentLines = value.split('\n');

        const [currentLineRemaining, ...nextLines] = currentLines.map(line => [type, line]);
        const next = [
            ...lines.slice(0, -1),
            [...last(lines), currentLineRemaining],
            ...nextLines.map(line => [line])
        ];
        return next;
    },
    [[]]
);

const diffsToEdits = (diffs, lineNumber) => {
    const output = diffs.reduce(
        (output, diff) => {
            const [edits, start] = output;
            const [type, value] = diff;
            if (type !== DIFF_EQUAL) {
                const edit = {
                    type: 'edit',
                    lineNumber: lineNumber,
                    start: start,
                    length: value.length
                };
                edits.push(edit);
            }

            return [edits, start + value.length];
        },
        [[], 0]
    );

    return output[0];
};

const convertToLinesOfEdits = (linesOfDiffs, startLineNumber) => flatMap(
    linesOfDiffs,
    (diffs, i) => diffsToEdits(diffs, startLineNumber + i)
);

const diffText = (x, y) => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(x, y);
    dmp.diff_cleanupSemantic(diffs);

    if (diffs.length <= 1) {
        return [[], []];
    }

    return groupDiffs(diffs);
};

const diffChangeBlock = changes => {
    const [oldSource, newSource] = changes.reduce(
        ([oldSource, newSource], {isDelete, content}) => (
            isDelete
                ? [oldSource + (oldSource ? '\n' : '') + content, newSource]
                : [oldSource, newSource + (newSource ? '\n' : '') + content]
        ),
        ['', '']
    );

    const [oldDiffs, newDiffs] = diffText(oldSource, newSource);

    if (oldDiffs.length === 0 && newDiffs.length === 0) {
        return [oldDiffs, newDiffs];
    }

    const getLineNumber = change => change && change.lineNumber;
    const oldStartLineNumber = getLineNumber(changes.find(change => change.isDelete));
    const newStartLineNumber = getLineNumber(changes.find(change => change.isInsert));
    const oldEdits = convertToLinesOfEdits(splitDiffToLines(oldDiffs), oldStartLineNumber);
    const newEdits = convertToLinesOfEdits(splitDiffToLines(newDiffs), newStartLineNumber);

    return [oldEdits, newEdits];
};

const diffByLine = changes => changes.reduce(
    ([oldEdits, newEdits, previousChange], currentChange) => {
        if (!previousChange.isDelete || !currentChange.isInsert) {
            return [oldEdits, newEdits, currentChange];
        }

        const [oldDiffs, newDiffs] = diffText(previousChange.content, currentChange.content);
        return [
            oldEdits.concat(diffsToEdits(oldDiffs, previousChange.lineNumber)),
            newEdits.concat(diffsToEdits(newDiffs, currentChange.lineNumber)),
            currentChange
        ];
    },
    [[], [], {}]
);

export default (hunks, {type = 'block'} = {}) => {
    const changeBlocks = flatMap(hunks.map(hunk => hunk.changes), findChangeBlocks);
    const findEdits = type === 'block' ? diffChangeBlock : diffByLine;

    const [oldEdits, newEdits] = changeBlocks.map(findEdits).reduce(
        ([oldEdits, newEdits], [currentOld, currentNew]) => [
            oldEdits.concat(currentOld),
            newEdits.concat(currentNew)
        ],
        [[], []]
    );

    return pickRanges(flatten(oldEdits), flatten(newEdits));
};
