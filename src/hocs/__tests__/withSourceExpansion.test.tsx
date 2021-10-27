import * as renderer from 'react-test-renderer';
import {Diff, Hunk, HunkType} from '../..';
import {basic, basicHunk} from '../../__tests__/cases';
import {withSourceExpansion} from '..';

function ComponentIn() {
    return <div />;
}

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

interface PropsUnfoldCollapsed {
    previousHunk: HunkType;
    currentHunk: HunkType;
    onClick: (start: number, end: number) => void;
}

function UnfoldCollapsed({previousHunk, currentHunk, onClick}: PropsUnfoldCollapsed) {
    const start = previousHunk ? previousHunk.oldStart + previousHunk.oldLines : 1;
    const end = currentHunk.oldStart - 1;

    /* eslint-disable react/jsx-no-bind */
    return (
        <div onClick={() => onClick(start, end)}>
            Click to expand
        </div>
    );
    /* eslint-enable react/jsx-no-bind */
}

interface PropsDiffView {
    hunks: HunkType[];
    onExpandRange: () => void;
}

function DiffView({hunks, onExpandRange}: PropsDiffView) {
    const renderHunk = (children: any[], hunk: HunkType) => {
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

    return (
        <Diff hunks={hunks} diffType="modify" viewType="split">
            {hunks => hunks.reduce(renderHunk, [])}
        </Diff>
    );
}

describe('withSourceExpansion document usage', () => {
    test('renders correctly', () => {
        const EnhancedDiffView = withSourceExpansion()(DiffView);
        expect(renderer.create(
            <EnhancedDiffView oldSource={basic} hunks={[basicHunk]} />
        ).toJSON()).toMatchSnapshot();
    });
});
