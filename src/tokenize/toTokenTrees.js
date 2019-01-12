import {flatMap, last, keyBy} from 'lodash';
import {computeOldLineNumber, computeNewLineNumber} from '../utils';

const applyDiff = (oldSource, hunks) => {
    const lines = oldSource.split('\n');
    const changes = hunks.reduce(
        (changes, hunk) => changes.concat(hunk.changes),
        []
    );

    const [patchedLines] = changes.reduce(
        ([lines, continuousDeleteCount], {lineNumber, content, isInsert, isDelete}) => {
            if (isDelete) {
                lines.splice(lineNumber - 1 - continuousDeleteCount, 1);
                return [lines, continuousDeleteCount + 1];
            }

            if (isInsert) {
                lines.splice(lineNumber - 1, 0, content);
            }

            return [lines, 0];
        },
        [lines, 0]
    );

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


