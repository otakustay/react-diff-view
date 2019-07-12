import refractor from 'refractor';
import toTokenTrees from '../toTokenTrees';

// eslint-disable-next-line max-len
const content = '<img style="width:<?php echo (80 / count($images)) ?>%" src=\'<?php echo Component_Union_FinanceInfoModel::UNION_LICEPIC_URL_PREFIX . $image?>\'/>';

describe('toTokenTrees', () => {
    test('php will renders __PHP__', () => {
        const options = {
            highlight: true,
            refractor: refractor,
            language: 'php',
            oldSource: null,
            enhancers: [],
        };

        const hunks = [{
            changes: [
                {
                    content,
                    isInsert: true,
                    lineNumber: 1,
                    type: 'insert',
                },
            ],
            content: '@@ -1,10 +1,17 @@',
            isPlain: false,
            newLines: 17,
            newStart: 1,
            oldLines: 10,
            oldStart: 1,
        }];

        const tokens = toTokenTrees(hunks, options);
        expect(tokens).toMatchSnapshot();
    });

    test('refractor highlight', () => {
        expect(refractor.highlight(content, 'php')).toMatchSnapshot();
    });
});
