import {tokenize, markEdits, markWord} from 'react-diff-view/tokenize';
import {compact} from 'lodash';
import refractor from 'refractor';

self.addEventListener(
    'message',
    ({data: {id, payload}}) => {
        const {hunks, oldSource, language, editsType} = payload;

        const enhancers = [
            markWord('\r', 'carriage-return', '␍'),
            markWord('\t', 'tab', '→'),
            editsType === 'none' ? null : markEdits(hunks, {type: editsType}),
        ];

        const options = {
            highlight: language !== 'text',
            refractor: refractor,
            language: language,
            oldSource: oldSource,
            enhancers: compact(enhancers),
        };

        try {
            const tokens = tokenize(hunks, options);
            const payload = {
                success: true,
                tokens: tokens,
            };
            self.postMessage({id, payload});
        }
        catch (ex) {
            const payload = {
                success: false,
                reason: ex.message,
            };
            self.postMessage({id, payload});
        }
    }
);
