import {useState, useRef, useEffect} from 'react';
import {flatMap, isEqual} from 'lodash';
import {HunkType, TokenizeOptions, UseTokenizeWorker} from '../interface';
import {useCustomEqualIdentifier} from './helpers';

let current = 0;
const uid = () => {
    current = current + 1;
    return current;
};

const findAbnormalChanges = (hunks: HunkType[]) => {
    return flatMap(hunks, hunk => hunk.changes.filter(change => !change.isNormal));
};

const areHunksEqual = (xHunks: HunkType[], yHunks: HunkType[]) => {
    const xChanges = findAbnormalChanges(xHunks);
    const yChanges = findAbnormalChanges(yHunks);

    return isEqual(xChanges, yChanges);
};

interface ParamsTokenize {
    hunks: HunkType[];
    oldSource: string;
}

const defaultShouldTokenize = (current: ParamsTokenize, previous: ParamsTokenize) => {
    const {hunks: currentHunks, ...currentPayload} = current;
    const {hunks: prevHunks, ...prevPayload} = previous;
    if (currentPayload.oldSource !== prevPayload.oldSource) {
        return true;
    }

    // When `oldSource` is provided, we can get the new source by applying diff,
    // so when hunks keep identical, the tokenize result will always remain the same.
    if (currentPayload.oldSource) {
        return !isEqual(currentPayload, prevPayload) || !areHunksEqual(currentHunks, prevHunks);
    }

    return currentHunks !== prevHunks || !isEqual(currentPayload, prevPayload);
};

const useTokenizeWorker: UseTokenizeWorker = (worker, payload, options: TokenizeOptions = {}) => {
    const {shouldTokenize = defaultShouldTokenize} = options;
    const payloadIdentifier = useCustomEqualIdentifier(
        payload,
        (current: ParamsTokenize, previous: ParamsTokenize) => !shouldTokenize(current, previous)
    );
    const [tokenizeResult, setTokenizeResult] = useState({tokens: null, tokenizationFailReason: null});
    const job = useRef(null);
    useEffect(
        () => {
            const receiveTokens = ({data: {payload, id}}: any) => {
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
            // @ts-ignore
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

export default useTokenizeWorker;
