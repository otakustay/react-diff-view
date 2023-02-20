import toTokenTrees, {ToTokenTreeOptions} from './toTokenTrees';
import normalizeToLines from './normalizeToLines';
import backToTree from './backToTree';
import {HunkData} from '../utils';
import {TokenizeEnhancer, TokenPath} from './interface';

export {Pair, TextNode, TokenNode, TokenPath, TokenizeEnhancer} from './interface';
export {default as pickRanges, RangeTokenNode} from './pickRanges';
export {default as markEdits} from './markEdits';
export {default as markWord} from './markWord';

export type TokenizeOptions = ToTokenTreeOptions & {enhancers?: TokenizeEnhancer[]};

export const tokenize = (hunks: HunkData[], {enhancers = [], ...options}: TokenizeOptions = {}) => {
    const [oldTokenTree, newTokenTree] = toTokenTrees(hunks, options);
    const [oldLinesOfPaths, newLinesOfPaths] = [normalizeToLines(oldTokenTree), normalizeToLines(newTokenTree)];

    const enhance = (pair: [TokenPath[][], TokenPath[][]]) => enhancers.reduce(
        (input, enhance) => enhance(input),
        pair
    );
    const [oldEnhanced, newEnhanced] = enhance([oldLinesOfPaths, newLinesOfPaths]);
    const [oldTrees, newTrees] = [oldEnhanced.map(backToTree), newEnhanced.map(backToTree)];
    return {
        old: oldTrees.map(root => root.children),
        new: newTrees.map(root => root.children),
    };
};
