/**
 * @file 在高亮的语法节点上插入代码定义与引用的信息
 * @author zhanglili
 */

import {last, isEmpty, groupBy} from 'lodash';
import {split} from './utils';

const splitPathToEncloseRange = (paths, node) => {
    const {start, length, properties} = node;
    const rangeEnd = start + length;
    const [output] = paths.reduce(
        ([output, nodeStart], path) => {
            const leaf = last(path);
            const nodeEnd = nodeStart + leaf.value.length;

            if (nodeStart > rangeEnd || nodeEnd < start) {
                output.push(path);
            }
            else {
                // it should be just node in next major release
                const wrapNode = {...node, ...properties};
                const segments = split(path, start - nodeStart, rangeEnd - nodeStart, wrapNode);
                output.push(...segments);
            }

            return [output, nodeEnd];
        },
        [[], 0]
    );

    return output;
};

const pickRangesFromPath = (paths, ranges) => {
    if (isEmpty(ranges)) {
        return paths;
    }

    return ranges.reduce(splitPathToEncloseRange, paths);
};

const process = (linesOfPaths, ranges) => {
    const rangesByLine = groupBy(ranges, 'lineNumber');
    return linesOfPaths.map((line, i) => pickRangesFromPath(line, rangesByLine[i + 1]));
};

export default (oldRanges, newRanges) => ([oldLinesOfPaths, newLinesOfPaths]) => [
    process(oldLinesOfPaths, oldRanges),
    process(newLinesOfPaths, newRanges),
];
