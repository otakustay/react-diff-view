import {tokenize, markEdits, markWord} from 'react-diff-view/tokenize';
import {compact} from 'lodash';
import refractor from 'refractor';

self.addEventListener(
    'message',
    ({data: {id, hunks, oldSource, language, editsType}}) => {
        const enhancers = [
            markWord('\r', 'carriage-return', '␍'),
            markWord('\t', 'tab', '→'),
            editsType === 'none' ? null : markEdits(hunks, {type: editsType})
        ];

        const options = {
            highlight: language !== 'text',
            refractor: refractor,
            language: language,
            oldSource: oldSource,
            enhancers: compact(enhancers)
        };

        const tokens = tokenize(hunks, options);
        self.postMessage({id, tokens});
    }
);
