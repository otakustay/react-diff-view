import {wrapDisplayName} from 'recompose';
import {ComponentType} from 'react';
import {TokenizeOptions} from '../interface';
import {useTokenizeWorker} from '../hooks';

const defaultMapPayload = (data: any) => {
    return data;
};

interface Options extends TokenizeOptions {
    mapPayload?: (payload: any, props: any) => any;
}

const withTokenizeWorker = (worker: Worker, options: Options = {}) => {
    const {mapPayload = defaultMapPayload, ...hookOptions} = options;

    const resolveMessagePayload = (props: any) => {
        const {hunks, oldSource, language} = props;
        const input = {
            language: language,
            oldSource: oldSource,
            hunks: hunks,
        };
        return mapPayload(input, props);
    };

    return (ComponentIn: ComponentType<any>) => {
        function ComponentOut(props: any) {
            const payload = resolveMessagePayload(props);
            const tokenizationResult = useTokenizeWorker(worker, payload, hookOptions);

            return <ComponentIn {...props} {...tokenizationResult} />;
        }

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withTokenizeWorker');

        return ComponentOut;
    };
};

export default withTokenizeWorker;
