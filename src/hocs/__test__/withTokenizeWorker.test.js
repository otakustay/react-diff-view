import renderer from 'react-test-renderer';
import withTokenizeWorker from '../withTokenizeWorker';

const journey = [];
let handleReceiveTokens = null;
const worker = {
    addEventListener(type, receiveTokens) {
        journey.push(['addEventListener', type, typeof receiveTokens]);
        handleReceiveTokens = receiveTokens;
    },
    removeEventListener(type, receiveTokens) {
        journey.push(['removeEventListener', type, typeof receiveTokens]);
        handleReceiveTokens = null;
    },
    postMessage(data) {
        journey.push(['postMessage', typeof data]);
        handleReceiveTokens({data});
    }
};
const ComponentIn = () => <div />;

describe('withTokenizeWorker', () => {
    test('returns a hoc function', () => {
        expect(typeof withTokenizeWorker(worker)).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof withTokenizeWorker(worker)(ComponentIn)).toBe('function');
    });

    test('render component', () => {
        const ComponentOut = withTokenizeWorker(worker)(ComponentIn);
        expect(renderer.create(<ComponentOut />).toJSON()).toMatchSnapshot();
        expect(journey).toEqual([
            ['addEventListener', 'message', 'function'],
            ['postMessage', 'object']
        ]);
    });
});
