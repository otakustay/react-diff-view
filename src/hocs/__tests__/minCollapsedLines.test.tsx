import * as renderer from 'react-test-renderer';
import {basicHunk} from '../../__tests__/cases';
import {minCollapsedLines} from '..';

function ComponentIn() {
    return <div />;
}

describe('minCollapsedLines', () => {
    test('returns a hoc function', () => {
        expect(typeof minCollapsedLines(0)).toBe('function');
    });

    test('hoc function return a component', () => {
        expect(typeof minCollapsedLines(0)(ComponentIn)).toBe('function');
    });

    test('render component', () => {
        const ComponentOut = minCollapsedLines(0)(ComponentIn);
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
