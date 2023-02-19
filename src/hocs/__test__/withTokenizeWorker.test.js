import renderer from 'react-test-renderer';
import {withTokenizeWorker} from '..';

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
    },
};
const ComponentIn = () => <div />;

describe('withTokenizeWorker', () => {
    test('returns a hoc function', () => {
        expect(typeof withTokenizeWorker(worker)).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof withTokenizeWorker(worker)(ComponentIn)).toBe('function');
    });

    test('render component', async () => {
        const ComponentOut = withTokenizeWorker(worker)(ComponentIn);
        const wrapper = renderer.create(<ComponentOut />);
        expect(wrapper.toJSON()).toMatchSnapshot();

        // wait for effect trigger: https://github.com/facebook/react/issues/14050
        await renderer.act(() => Promise.resolve());
        expect(journey).toEqual([
            ['addEventListener', 'message', 'function'],
            ['postMessage', 'object'],
        ]);
        wrapper.unmount();
        // wait for effect trigger: https://github.com/facebook/react/issues/14050
        await renderer.act(() => Promise.resolve());
        expect(journey).toEqual([
            ['addEventListener', 'message', 'function'],
            ['postMessage', 'object'],
            ['removeEventListener', 'message', 'function'],
        ]);
    });
});
