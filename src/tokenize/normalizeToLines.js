import {last, omit} from 'lodash';
import {clone, replace} from './utils';

const treeToPathList = (node, output = [], path = []) => {
    const nodeToUse = omit(node, 'children');

    if (node.children) {
        path.push(nodeToUse);
        for (const child of node.children) {
            treeToPathList(child, output, path);
        }
        path.pop();
    }
    else {
        output.push(clone([...path.slice(1), nodeToUse]));
    }

    return output;
};

const splitPathToLines = path => {
    const leaf = last(path);

    if (!leaf.value.includes('\n')) {
        return [path];
    }

    const linesOfText = leaf.value.split('\n');
    return linesOfText.map(line => replace(path, {...leaf, value: line}));
};

const splitByLineBreak = paths => paths.reduce(
    (lines, path) => {
        const currentLine = last(lines);
        const [currentRemaining, ...nextLines] = splitPathToLines(path);
        return [
            ...lines.slice(0, -1),
            [...currentLine, currentRemaining],
            ...nextLines.map(path => [path]),
        ];
    },
    [[]]
);

export default tree => {
    const paths = treeToPathList(tree);
    const linesOfPaths = splitByLineBreak(paths);
    return linesOfPaths;
};
