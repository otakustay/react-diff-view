import {flatMap, last} from 'lodash';
import {replace} from './utils';

const markInPaths = (word, name) => paths => flatMap(
    paths,
    path => {
        const leaf = last(path);

        if (!leaf.value.includes(word)) {
            return [path];
        }

        const segments = leaf.value.split(word);

        return segments.reduce(
            (output, text, i) => {
                if (i !== 0) {
                    output.push(replace(path, {type: 'mark', markType: name, value: word}));
                }

                if (text) {
                    output.push(replace(path, {...leaf, value: text}));
                }

                return output;
            },
            []
        );
    }
);

const process = (linesOfPaths, word, name) => linesOfPaths.map(markInPaths(word, name));

export default (word, name) => ([oldLinesOfPaths, newLinesOfPaths]) => [
    process(oldLinesOfPaths, word, name),
    process(newLinesOfPaths, word, name)
];
