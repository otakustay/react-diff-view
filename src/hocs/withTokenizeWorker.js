import {Component} from 'react';
import {wrapDisplayName} from 'recompose';
import shallowEquals from 'shallow-equal/objects';
import arrayShallowEquals from 'shallow-equal/arrays';
import {flatMap} from 'lodash';

const uid = (() => {
    let current = 0;

    return () => {
        current = current + 1;
        return current;
    };
})();

const defaultMapPayload = data => {
    return data;
};

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

export default (worker, options = {}) => {
    const {mapPayload = defaultMapPayload, shouldTokenize = defaultShouldTokenize} = options;

    const resolveMessagePayload = props => {
        const {hunks, oldSource, language} = props;
        const input = {
            language: language,
            oldSource: oldSource,
            hunks: hunks,
        };
        return mapPayload(input, props);
    };

    return ComponentIn => class ComponentOut extends Component {

        static displayName = wrapDisplayName(ComponentIn, 'withTokenizeWorker');

        state = {
            tokens: null,
            tokenizationFailReason: null,
        };

        jobID = null;

        componentDidMount() {
            worker.addEventListener('message', this.receiveTokens);

            const payload = resolveMessagePayload(this.props);

            if (shouldTokenize(payload, {})) {
                this.tokenize(payload);
            }
        }

        componentDidUpdate(prevProps) {
            const prevPayload = resolveMessagePayload(prevProps);
            const currentPayload = resolveMessagePayload(this.props);

            if (shouldTokenize(currentPayload, prevPayload)) {
                this.tokenize(currentPayload);
            }
        }

        componentWillUnmount() {
            worker.removeEventListener('message', this.receiveTokens);
        }

        tokenize = payload => {
            this.jobID = uid();
            const data = {
                id: this.jobID,
                type: 'tokenize',
                payload: payload,
            };
            worker.postMessage(data);
        };

        receiveTokens = ({data: {payload, id}}) => {
            if (id !== this.jobID) {
                return;
            }

            if (payload.success) {
                this.setState({tokens: payload.tokens, tokenizationFailReason: null});
            }
            else {
                this.setState({tokens: null, tokenizationFailReason: payload.reason});
            }
        };

        render() {
            return <ComponentIn {...this.props} {...this.state} />;
        }
    };
};
