import {flatMap} from 'lodash';
import {TokenizeEnhancer, TokenPath} from './interface';
import {leafOf, replace} from './utils';

function markInPaths(word: string, name: string, replacement: string) {
    return (paths: TokenPath[]) => flatMap(
        paths,
        path => {
            const leaf = leafOf(path);

            if (!leaf.value.includes(word)) {
                return [path];
            }

            const segments = leaf.value.split(word);

            return segments.reduce<TokenPath[]>(
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
}

export default function markWord(word: string, name: string, replacement = word): TokenizeEnhancer {
    const mark = markInPaths(word, name, replacement);

    return ([oldLinesOfPaths, newLinesOfPaths]) => [
        oldLinesOfPaths.map(mark),
        newLinesOfPaths.map(mark),
    ];
}
