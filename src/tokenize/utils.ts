import {ProcessingNode, TextNode, TokenPath} from './interface';

export function clone(path: TokenPath): TokenPath {
    return path.map(node => ({...node}));
}

export function replace(path: TokenPath, leaf: ProcessingNode): TokenPath {
    return [...clone(path.slice(0, -1)), leaf];
}

export function wrap(path: TokenPath, parent: ProcessingNode): TokenPath {
    return [parent, ...clone(path)];
}

function isTextNode(node: ProcessingNode): node is TextNode {
    return node.type === 'text';
}

export function leafOf(path: TokenPath): TextNode {
    const last = path[path.length - 1];

    if (isTextNode(last)) {
        return last;
    }

    throw new Error(`Invalid token path with leaf of type ${last.type}`);
}

export function split(path: TokenPath, splitStart: number, splitEnd: number, wrapSplitNode: ProcessingNode) {
    const parents = path.slice(0, -1);
    const leaf = leafOf(path);
    const output = [];

    if (splitEnd <= 0 || splitStart >= leaf?.value.length) {
        return [path];
    }

    const split = (start: number, end?: number) => {
        const value = leaf.value.slice(start, end);
        return [...parents, {...leaf, value}];
    };

    if (splitStart > 0) {
        const head = split(0, splitStart);
        output.push(clone(head));
    }

    const body = split(Math.max(splitStart, 0), splitEnd);
    output.push(wrapSplitNode ? wrap(body, wrapSplitNode) : clone(body));

    if (splitEnd < leaf.value.length) {
        const tail = split(splitEnd);
        output.push(clone(tail));
    }

    return output;
}
