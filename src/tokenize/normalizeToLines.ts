import {TokenNode, TokenPath} from './interface';
import {clone, leafOf, replace} from './utils';

function treeToPathList(node: TokenNode, output: TokenPath[] = [], path: TokenPath = []): TokenPath[] {
    if (node.children) {
        const {children, ...nodeToUse} = node;
        path.push(nodeToUse);
        for (const child of children) {
            treeToPathList(child, output, path);
        }
        path.pop();
    }
    else {
        output.push(clone([...path.slice(1), node]));
    }

    return output;
}

function splitPathToLines(path: TokenPath) {
    const leaf = leafOf(path);

    if (!leaf.value.includes('\n')) {
        return [path];
    }

    const linesOfText = leaf.value.split('\n');
    return linesOfText.map(line => replace(path, {...leaf, value: line}));
}

function splitByLineBreak(paths: TokenPath[]): TokenPath[][] {
    return paths.reduce<TokenPath[][]>(
        (lines, path) => {
            const currentLine = lines[lines.length - 1];
            const [currentRemaining, ...nextLines] = splitPathToLines(path);
            return [
                ...lines.slice(0, -1),
                [...currentLine, currentRemaining],
                ...nextLines.map(path => [path]),
            ];
        },
        [[]]
    );
}

export default function normalizeToLines(tree: TokenNode): TokenPath[][] {
    const paths = treeToPathList(tree);
    const linesOfPaths = splitByLineBreak(paths);
    return linesOfPaths;
}
