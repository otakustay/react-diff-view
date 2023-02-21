/**
 * @file 在高亮的语法节点上插入代码定义与引用的信息
 * @author zhanglili
 */

import {isEmpty, groupBy} from 'lodash';
import {TokenizeEnhancer, TokenPath} from './interface';
import {leafOf, split} from './utils';

export interface RangeTokenNode {
    type: string;
    lineNumber: number;
    start: number;
    length: number;
}

const splitPathToEncloseRange = (paths: TokenPath[], node: RangeTokenNode) => {
    const {start, length} = node;
    const rangeEnd = start + length;
    const [output] = paths.reduce<[TokenPath[], number]>(
        ([output, nodeStart], path) => {
            const leaf = leafOf(path);
            const nodeEnd = nodeStart + leaf.value.length;

            if (nodeStart > rangeEnd || nodeEnd < start) {
                output.push(path);
            }
            else {
                const segments = split(path, start - nodeStart, rangeEnd - nodeStart, node);
                output.push(...segments);
            }

            return [output, nodeEnd];
        },
        [[], 0]
    );

    return output;
};

function pickRangesFromPath(paths: TokenPath[], ranges: RangeTokenNode[]) {
    if (isEmpty(ranges)) {
        return paths;
    }

    return ranges.reduce(splitPathToEncloseRange, paths);
}

function process(linesOfPaths: TokenPath[][], ranges: RangeTokenNode[]) {
    const rangesByLine = groupBy(ranges, 'lineNumber');
    return linesOfPaths.map((line, i) => pickRangesFromPath(line, rangesByLine[i + 1]));
}

export default function pickRanges(oldRanges: RangeTokenNode[], newRanges: RangeTokenNode[]): TokenizeEnhancer {
    return ([oldLinesOfPaths, newLinesOfPaths]) => [
        process(oldLinesOfPaths, oldRanges),
        process(newLinesOfPaths, newRanges),
    ];
}
