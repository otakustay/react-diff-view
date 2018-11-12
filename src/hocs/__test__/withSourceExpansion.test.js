import renderer from 'react-test-renderer';
import {withSourceExpansion} from '..';
import {Diff, Hunk} from '../..';
import {basic, basicHunk} from '../../__test__/cases';

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

const UnfoldCollapsed = ({previousHunk, currentHunk, onClick}) => {
    const start = previousHunk ? previousHunk.oldStart + previousHunk.oldLines : 1;
    const end = currentHunk.oldStart - 1;

    /* eslint-disable react/jsx-no-bind */
    return (
        <div onClick={() => onClick(start, end)}>
            Click to expand
        </div>
    );
    /* eslint-enable react/jsx-no-bind */
};

const renderHunk = onExpandRange => (children, hunk) => {
    const previousElement = children[children.length - 1];
    const decorationElement = (
        <UnfoldCollapsed
            key={'decoration-' + hunk.content}
            previousHunk={previousElement && previousElement.props.hunk}
            currentHunk={hunk}
            onClick={onExpandRange}
        />
    );
    children.push(decorationElement);

    const hunkElement = (
        <Hunk
            key={'hunk-' + hunk.content}
            hunk={hunk}
        />
    );
    children.push(hunkElement);

    return children;
};

const DiffView = ({hunks, onExpandRange}) => (
    <Diff hunks={hunks} diffType="modify" viewType="split">
        {hunks => hunks.reduce(renderHunk(onExpandRange), [])}
    </Diff>
);

describe('withSourceExpansion document usage', () => {
    test('renders correctly', () => {
        const EnhancedDiffView = withSourceExpansion()(DiffView);
        expect(renderer.create(
            <EnhancedDiffView oldSource={basic} hunks={[basicHunk]} />
        ).toJSON()).toMatchSnapshot();
    });
});
