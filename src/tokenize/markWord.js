import {flatMap, last} from 'lodash';
import {replace} from './utils';

const markInPaths = (word, name, replacement) => paths => flatMap(
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
                    output.push(replace(path, {type: 'mark', markType: name, value: replacement}));
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

export default (word, name, replacement = word) => {
    const mark = markInPaths(word, name, replacement);

    return ([oldLinesOfPaths, newLinesOfPaths]) => [
        oldLinesOfPaths.map(mark),
        newLinesOfPaths.map(mark)
    ];
};
