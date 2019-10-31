import renderer from 'react-test-renderer';
import {Diff, Hunk, parseDiff, tokenize, markEdits, pickRanges} from '../..';

describe('pickRange', () => {
    test('for definition', () => {
        const oldSource = `// Copyright

package com.xxx;

import java.util.List;
import java.util.Set;`;

        const diffText = `diff --git a/a b/b
index 5b25e5b..772d084 100644
--- a/a
+++ b/b
@@ -2,6 +2,7 @@
 
 package com.xxx;
 
+import java.util.Date;
 import java.util.List;
 import java.util.Set;`;

        const defs = [{
            id: 'yz5k9m0BvISpUQ2asedw',
            type: 'def',
            row: 3,
            col: 9,
            binding: 'package',
            length: 7,
            token: 'com.xxx',
        }];

        const renderToken = (token, defaultRender, i) => {
            switch (token.type) {
                case 'ref':
                case 'def':
                    return <span key={`def-${i}`} className="def">{defaultRender(token.children[0], i)}</span>;
                case 'space':
                default:
                    return defaultRender(token, i);
            }
        };

        const tokenizer = hunks => {
            if (!hunks) {
                return null;
            }

            const options = {
                highlight: false,
                enhancers: [
                    markEdits(hunks, {type: 'block'}),
                    pickRanges([], defs.map(i => ({...i, lineNumber: i.row, start: i.col - 1}))),
                ],
            };

            try {
                return tokenize(hunks, options);
            } catch (ex) {
                return null;
            }
        };

        const [diff] = parseDiff(diffText, {nearbySequences: 'zip'});

        const {type, hunks} = diff;

        const tokens = tokenizer(hunks);

        /* eslint-disable react/jsx-no-bind */
        expect(renderer.create(
            <Diff
                viewType="split"
                diffType={type}
                hunks={hunks}
                tokens={tokens}
                renderToken={renderToken}
                oldSource={oldSource}
            >
                {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
            </Diff>
        ).toJSON()).toMatchSnapshot();
    });
});
