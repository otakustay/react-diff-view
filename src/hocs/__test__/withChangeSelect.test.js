import renderer from 'react-test-renderer';
import {withChangeSelect} from '..';

const ComponentIn = () => <div />;

describe('withChangeSelect', () => {
    test('returns a hoc function', () => {
        expect(typeof withChangeSelect()).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof withChangeSelect()(ComponentIn)).toBe('function');
    });

    test('render component', () => {
        const ComponentOut = withChangeSelect()(ComponentIn);
        expect(renderer.create(<ComponentOut />).toJSON()).toMatchSnapshot();
    });
});
