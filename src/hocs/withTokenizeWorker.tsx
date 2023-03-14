import {ComponentType} from 'react';
import {TokenizePayload, TokenizeResult, TokenizeWorkerOptions, useTokenizeWorker} from '../hooks';
import {HunkData, Source} from '../utils';
import {wrapDisplayName} from './wrapDisplayName';

export interface RequiredProps {
    hunks: HunkData[];
    oldSource: Source;
    language: string;
}

function defaultMapPayload(data: RequiredProps) {
    return data;
}

interface ToeknizeWorkerHocOptions<T extends TokenizePayload> extends TokenizeWorkerOptions<T> {
    mapPayload?: <P extends RequiredProps>(payload: RequiredProps, props: P) => any;
}

export default function withTokenizeWorkerwithTokenizeWorker<T extends TokenizePayload>(
    worker: Worker,
    options: ToeknizeWorkerHocOptions<T> = {}
) {
    const {mapPayload = defaultMapPayload, ...hookOptions} = options;

    function resolveMessagePayload<P extends RequiredProps>(props: P): T {
        const {hunks, oldSource, language} = props;
        const input = {language, oldSource, hunks};
        return mapPayload(input, props);
    }

    return function wrap<P>(ComponentIn: ComponentType<P & TokenizeResult>) {
        function ComponentOut(props: P & RequiredProps) {
            const payload = resolveMessagePayload(props);
            const tokenizationResult = useTokenizeWorker(worker, payload, hookOptions);

            return <ComponentIn {...props} {...tokenizationResult} />;
        }

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withTokenizeWorker');

        return ComponentOut;
    };
}
