import {flow} from 'lodash';
import toTokenTrees from './toTokenTrees';
import normalizeToLines from './normalizeToLines';
import backToTree from './backToTree';

export const tokenize = (hunks, options) => {
    const {
        highlight = false,
        refractor,
        oldSource,
        language,
        enhancers = []
    } = options;

    const tokenTreesPair = toTokenTrees(hunks, {highlight, refractor, oldSource, language});
    const linesOfPathsPair = tokenTreesPair.map(normalizeToLines);

    const enhance = flow(enhancers);
    const enhancedLinesOfPathsPair = enhance(linesOfPathsPair);
    const [oldTrees, newTrees] = enhancedLinesOfPathsPair.map(paths => paths.map(backToTree));
    return {
        old: oldTrees.map(root => root.children),
        new: newTrees.map(root => root.children)
    };
};

export pickRanges from './pickRanges';

export markEdits from './markEdits';

export markWord from './markWord';
