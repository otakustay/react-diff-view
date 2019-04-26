import {flatMap, last, keyBy} from 'lodash';
import {computeOldLineNumber, computeNewLineNumber} from '../utils';

// This function mutates `linesOfCode` argument.
const applyHunk = (linesOfCode, {newStart, changes}) => {
    // Within each hunk, changes are continous, so we can use a sequential algorithm here.
    //
    // When `linesOfCode` is received here, it has already patched by previous hunk,
    // thus the starting line number has changed due to possible unbanlanced deletions and insertions,
    // we should use `newStart` as the first line number of current reduce.
    const [patchedLines] = changes.reduce(
        ([lines, cursor], {content, isInsert, isDelete}) => {
            if (isDelete) {
                lines.splice(cursor, 1);
                return [lines, cursor];
            }

            if (isInsert) {
                lines.splice(cursor, 0, content);
            }
            return [lines, cursor + 1];
        },
        [linesOfCode, newStart - 1]
    );

    return patchedLines;
};

const applyDiff = (oldSource, hunks) => {
    // `hunks` must be ordered here.
    const patchedLines = hunks.reduce(applyHunk, oldSource.split('\n'));
    return patchedLines.join('\n');
};

const mapChanges = (changes, side, toValue) => {
    if (!changes.length) {
        return [];
    }

    const computeLineNumber = side === 'old' ? computeOldLineNumber : computeNewLineNumber;
    const changesByLineNumber = keyBy(changes, computeLineNumber);
    const maxLineNumber = computeLineNumber(last(changes));
    return Array.from({length: maxLineNumber}).map((value, i) => toValue(changesByLineNumber[i + 1]));
};

const groupChanges = hunks => {
    const changes = flatMap(hunks, hunk => hunk.changes);
    return changes.reduce(
        ([oldChanges, newChanges], change) => {
            if (change.isNormal) {
                oldChanges.push(change);
                newChanges.push(change);
            }
            else if (change.isDelete) {
                oldChanges.push(change);
            }
            else {
                newChanges.push(change);
            }

            return [oldChanges, newChanges];
        },
        [[], []]
    );
};

const toTextPair = hunks => {
    const [oldChanges, newChanges] = groupChanges(hunks);
    const toText = change => (change ? change.content : '');
    const oldText = mapChanges(oldChanges, 'old', toText).join('\n');
    const newText = mapChanges(newChanges, 'new', toText).join('\n');

    return [oldText, newText];
};

const createRoot = children => ({type: 'root', children: children});

export default (hunks, {highlight, refractor, oldSource, language}) => {
    if (oldSource) {
        const newSource = applyDiff(oldSource, hunks);
        const highlightText = highlight
            ? (text, language) => refractor.highlight(text, language)
            : text => [{type: 'text', value: text}];

        return [
            createRoot(highlightText(oldSource, language)),
            createRoot(highlightText(newSource, language)),
        ];
    }

    const textPair = toTextPair(hunks);
    const toTree = highlight
        ? text => createRoot(refractor.highlight(text, language))
        : text => createRoot([{type: 'text', value: text}]);

    return textPair.map(toTree);
};
