import renderer from 'react-test-renderer';
import {withChangeSelect} from '..';
import {Diff, Hunk} from '../..';
import {basicHunk} from '../../__test__/cases';

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

const DiffView = ({hunks, selectedChanges, onToggleChangeSelection}) => {
    const codeEvents = {
        onClick: onToggleChangeSelection,
    };
    const renderHunk = hunk => (
        <Hunk
            key={hunk.content}
            hunk={hunk}
            codeEvents={codeEvents}
        />
    );

    // TODO modify document
    return (
        <Diff hunks={hunks} selectedChanges={selectedChanges} diffType="modify" viewType="split" >
            {hunks => hunks.map(renderHunk)}
        </Diff>
    );
};

describe('withChangeSelect usage in document', () => {
    test('EnhancedDiffView snapshot', () => {
        const EnhancedDiffView = withChangeSelect({multiple: false})(DiffView);
        expect(renderer.create(<EnhancedDiffView hunks={[basicHunk]} />).toJSON()).toMatchSnapshot();
    });

    test('EnhancedDiffView snapshot with multiple', () => {
        const EnhancedDiffView = withChangeSelect({multiple: true})(DiffView);
        expect(renderer.create(<EnhancedDiffView hunks={[basicHunk]} />).toJSON()).toMatchSnapshot();
    });

    // TODO use enzyme to test click
});
