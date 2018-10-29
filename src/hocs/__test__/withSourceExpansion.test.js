import renderer from 'react-test-renderer';
import {withSourceExpansion} from '..';

const ComponentIn = () => <div />;

describe('withSourceExpansion', () => {
    test('returns a hoc function', () => {
        expect(typeof withSourceExpansion()).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof withSourceExpansion()(ComponentIn)).toBe('function');
    });

    test('render component', () => {
        const ComponentOut = withSourceExpansion()(ComponentIn);
        expect(renderer.create(<ComponentOut />).toJSON()).toMatchSnapshot();
    });
});
