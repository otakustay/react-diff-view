import {parseDiff} from 'react-diff-view/utils';

self.addEventListener(
    'message',
    ({data: {jobID, diffText, nearbySequences}}) => {
        const diff = parseDiff(diffText, {nearbySequences});

        self.postMessage({jobID, diff});
    }
);
