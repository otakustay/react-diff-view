import {wrapDisplayName} from 'recompose';
import {useTokenizeWorker} from '../hooks';

const defaultMapPayload = data => {
    return data;
};

export default (worker, options = {}) => {
    const {mapPayload = defaultMapPayload, ...hookOptions} = options;

    const resolveMessagePayload = props => {
        const {hunks, oldSource, language} = props;
        const input = {
            language: language,
            oldSource: oldSource,
            hunks: hunks,
        };
        return mapPayload(input, props);
    };

    return ComponentIn => {
        const ComponentOut = props => {
            const payload = resolveMessagePayload(props);
            const tokenizationResult = useTokenizeWorker(worker, payload, hookOptions);

            return <ComponentIn {...props} {...tokenizationResult} />;
        };

        ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withTokenizeWorker');

        return ComponentOut;
    };
};
