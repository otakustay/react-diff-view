import renderer from 'react-test-renderer';
import {minCollapsedLines} from '..';

const ComponentIn = () => <div />;

describe('minCollapsedLines', () => {
    test('returns a hoc function', () => {
        expect(typeof minCollapsedLines()).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof minCollapsedLines()(ComponentIn)).toBe('function');
    });

    test('render component', () => {
        const ComponentOut = minCollapsedLines()(ComponentIn);
        expect(renderer.create(<ComponentOut />).toJSON()).toMatchSnapshot();
    });
});
