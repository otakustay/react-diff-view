import {useState, useRef, useEffect} from 'react';
import shallowEquals from 'shallow-equal/objects';
import arrayShallowEquals from 'shallow-equal/arrays';
import {flatMap} from 'lodash';
import {useCustomEqualIdentifier} from './helpers';

const uid = (() => {
    let current = 0;

    return () => {
        current = current + 1;
        return current;
    };
})();

const findAbnormalChanges = hunks => flatMap(hunks, hunk => hunk.changes.filter(change => !change.isNormal));

const areHunksEqual = (xHunks, yHunks) => {
    const xChanges = findAbnormalChanges(xHunks);
    const yChanges = findAbnormalChanges(yHunks);

    return arrayShallowEquals(xChanges, yChanges);
};

const defaultShouldTokenize = ({hunks: currentHunks, ...currentPayload}, {hunks: prevHunks, ...prevPayload}) => {
    if (currentPayload.oldSource !== prevPayload.oldSource) {
        return true;
    }

    // When `oldSource` is provided, we can get the new source by applying diff,
    // so when hunks keep identical, the tokenize result will always remain the same.
    if (currentPayload.oldSource) {
        return !shallowEquals(currentPayload, prevPayload) || !areHunksEqual(currentHunks, prevHunks);
    }

    return currentHunks !== prevHunks || !shallowEquals(currentPayload, prevPayload);
};

export default (worker, payload, options = {}) => {
    const {shouldTokenize = defaultShouldTokenize} = options;
    const payloadIdentifier = useCustomEqualIdentifier(
        payload,
        (current, previous) => !shouldTokenize(current, previous)
    );
    const [tokenizeResult, setTokenizeResult] = useState({tokens: null, tokenizationFailReason: null});
    const job = useRef(null);
    useEffect(
        () => {
            const receiveTokens = ({data: {payload, id}}) => {
                if (id !== job.current) {
                    return;
                }

                if (payload.success) {
                    setTokenizeResult({tokens: payload.tokens, tokenizationFailReason: null});
                }
                else {
                    setTokenizeResult({tokens: null, tokenizationFailReason: payload.reason});
                }
            };
            worker.addEventListener('message', receiveTokens);
            return () => worker.removeEventListener('message', receiveTokens);
        },
        [worker] // We don't really expect the worker to be changed in an application's lifecycle
    );
    useEffect(
        () => {
            job.current = uid();
            const data = {
                payload,
                id: job.current,
                type: 'tokenize',
            };
            worker.postMessage(data);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [payloadIdentifier, worker, shouldTokenize] // TODO: How about worker changes when payload keeps identical?
    );

    return tokenizeResult;
};
