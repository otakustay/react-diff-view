import {useState, useRef, useEffect} from 'react';
import {shallowEqualArrays, shallowEqualObjects} from 'shallow-equal';
import {flatMap} from 'lodash';
import {useCustomEqualIdentifier} from './helpers';
import {HunkData, isNormal} from '../utils';
import {HunkTokens} from '../tokenize';

const uid = (() => {
    let current = 0;

    return () => {
        current = current + 1;
        return current;
    };
})();

function findAbnormalChanges(hunks: HunkData[]) {
    return flatMap(hunks, hunk => hunk.changes.filter(change => !isNormal(change)));
}

function areHunksEqual(xHunks: HunkData[], yHunks: HunkData[]) {
    const xChanges = findAbnormalChanges(xHunks);
    const yChanges = findAbnormalChanges(yHunks);

    return shallowEqualArrays(xChanges, yChanges);
}

export interface TokenizePayload {
    hunks: HunkData[];
    oldSource: string | null;
}

export type ShouldTokenize<P extends TokenizePayload> = (current: P, prev: P | undefined) => boolean;

function defaultShouldTokenize<P extends TokenizePayload>(current: P, prev: P | undefined) {
    if (!prev) {
        return true;
    }

    const {hunks: currentHunks, ...currentPayload} = current;
    const {hunks: prevHunks, ...prevPayload} = prev;
    if (currentPayload.oldSource !== prevPayload.oldSource) {
        return true;
    }

    // When `oldSource` is provided, we can get the new source by applying diff,
    // so when hunks keep identical, the tokenize result will always remain the same.
    if (currentPayload.oldSource) {
        return !shallowEqualObjects(currentPayload, prevPayload) || !areHunksEqual(currentHunks, prevHunks);
    }

    return currentHunks !== prevHunks || !shallowEqualObjects(currentPayload, prevPayload);
}

export interface TokenizeWorkerOptions<P extends TokenizePayload> {
    shouldTokenize?: ShouldTokenize<P>;
}

interface WorkerResultSuccess {
    success: true;
    id: string;
    tokens: HunkTokens;
}

interface WorkerResultFail {
    success: false;
    reason: string;
}

interface WorkerMessageData {
    id: number;
    payload: WorkerResultSuccess | WorkerResultFail;
}

export interface TokenizeResult {
    tokens: HunkTokens | null;
    tokenizationFailReason: string | null;
}

export default function useTokenizeWorker<P extends TokenizePayload>(
    worker: Worker,
    payload: P,
    options: TokenizeWorkerOptions<P> = {}
) {
    const {shouldTokenize = defaultShouldTokenize} = options;
    const payloadIdentifier = useCustomEqualIdentifier(
        payload,
        (current, previous) => !shouldTokenize(current, previous)
    );
    const [tokenizeResult, setTokenizeResult] = useState<TokenizeResult>({tokens: null, tokenizationFailReason: null});
    const job = useRef<number | null>(null);
    useEffect(
        () => {
            const receiveTokens = ({data: {payload, id}}: MessageEvent<WorkerMessageData>) => {
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
}
