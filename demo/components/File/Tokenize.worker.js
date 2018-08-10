import {tokenize, markEdits, markWord} from 'react-diff-view/tokenize';
import refractor from 'refractor';

self.addEventListener(
    'message',
    ({data: {id, hunks, oldSource, highlight, language}}) => {
        const options = {
            highlight: highlight,
            refractor: refractor,
            language: language,
            enhancers: [
                markWord('\r', 'carriage-return'),
                markWord('\t', 'tab'),
                markEdits(hunks)
            ]
        };

        if (oldSource) {
            Object.assign(options, {oldSource});
        }

        const tokens = tokenize(hunks, options);
        self.postMessage({id, tokens});
    }
);
