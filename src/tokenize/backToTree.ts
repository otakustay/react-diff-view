// @ts-nocheck ignore: third-party
import {last, isEqual, omit} from 'lodash';

const areNodesMeregable = (x, y) => {
    if (x.type !== y.type) {
        return false;
    }

    if (x.type === 'text') {
        return true;
    }

    if (!x.children || !y.children) {
        return false;
    }

    const xBase = 'children' in x ? omit(x, 'children') : x;
    const yBase = 'children' in y ? omit(y, 'children') : y;

    return isEqual(xBase, yBase);
};

const mergeNode = (x, y) => {
    if ('value' in x) {
        return {
            ...x,
            value: x.value + y.value,
        };
    }

    return x;
};

const attachNode = (parent, node) => {
    const previousSibling = last(parent.children);

    if (previousSibling && areNodesMeregable(previousSibling, node)) {
        /* eslint-disable no-param-reassign */
        parent.children[parent.children.length - 1] = mergeNode(previousSibling, node);
        /* eslint-enable no-param-reassign */
    }
    else {
        parent.children.push(node);
    }

    return last(parent.children);
};

export default pathList => {
    const root = {type: 'root', children: []};

    for (const path of pathList) {
        path.reduce(
            (parent, node, i) => {
                const nodeToUse = i === path.length - 1 ? {...node} : {...node, children: []};
                return attachNode(parent, nodeToUse);
            },
            root
        );
    }

    return root;
};
