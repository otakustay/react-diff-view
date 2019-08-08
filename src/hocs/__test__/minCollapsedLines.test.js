import renderer from 'react-test-renderer';
import {basicHunk} from '../../__test__/cases';
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

    test('render component with minLinesExclusive', () => {
        const ComponentOut = minCollapsedLines(10)(ComponentIn);
        expect(renderer.create(<ComponentOut />).toJSON()).toMatchSnapshot();
    });

    test('render component with oldSource', () => {
        const ComponentOut = minCollapsedLines(10)(ComponentIn);
        expect(renderer.create(<ComponentOut oldSource hunks={[basicHunk]} />).toJSON()).toMatchSnapshot();
    });
});
