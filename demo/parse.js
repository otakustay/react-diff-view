import parseDiff from '../src/parse';

self.addEventListener(
    'message',
    ({data: {jobID, diffText, nearbySequences}}) => {
        const diff = parseDiff(diffText, {nearbySequences});

        self.postMessage({jobID, diff});
    }
);
