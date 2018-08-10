import {flatMap, last} from 'lodash';
import {replace} from './utils';

const markInPaths = (character, name) => paths => flatMap(
    paths,
    path => {
        const leaf = last(path);

        if (!leaf.value.includes(character)) {
            return [path];
        }

        const segments = leaf.value.split(character);

        return segments.reduce(
            (output, text, i) => {
                if (i !== 0) {
                    output.push(replace(path, {type: 'mark', markType: name, value: character}));
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

const process = (linesOfPaths, character, name) => linesOfPaths.map(markInPaths(character, name));

export default (character, name) => ([oldLinesOfPaths, newLinesOfPaths]) => [
    process(oldLinesOfPaths, character, name),
    process(newLinesOfPaths, character, name)
];
