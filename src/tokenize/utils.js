import {last} from 'lodash';

export const clone = path => path.map(node => ({...node}));

export const replace = (path, leaf) => [...clone(path.slice(0, -1)), leaf];

export const wrap = (path, parent) => [parent, ...clone(path)];

export const split = (path, splitStart, splitEnd, wrapSplitNode) => {
    const parents = path.slice(0, -1);
    const leaf = last(path);
    const output = [];

    if (splitEnd <= 0 || splitStart >= leaf.value.length) {
        return [path];
    }

    const split = (start, end) => {
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
};
