import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {Diff, Hunk} from '../..';
import {basicHunk} from '../../__test__/cases';
import {normalChange} from '../../__test__/changes.case';
import {withChangeSelect} from '..';

describe('withChangeSelect', () => {
    const ComponentIn = () => <div />;
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

describe('withChangeSelect usage in document', () => {
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

        return (
            <Diff hunks={hunks} selectedChanges={selectedChanges} diffType="modify" viewType="split" >
                {hunks => hunks.map(renderHunk)}
            </Diff>
        );
    };

    test('EnhancedDiffView snapshot', () => {
        const EnhancedDiffView = withChangeSelect({multiple: false})(DiffView);
        expect(renderer.create(<EnhancedDiffView hunks={[basicHunk]} />).toJSON()).toMatchSnapshot();
    });

    test('EnhancedDiffView snapshot with multiple', () => {
        const EnhancedDiffView = withChangeSelect({multiple: true})(DiffView);
        expect(renderer.create(<EnhancedDiffView hunks={[basicHunk]} />).toJSON()).toMatchSnapshot();
    });
});

describe('withChangeSelect handler', () => {
    const ComponentIn = () => <div />;

    test('onToggleChangeSelection', () => {
        const EnhancedDiffView = withChangeSelect({multiple: false})(ComponentIn);
        const wrapper = shallow(<EnhancedDiffView hunks={[]} />);
        expect(typeof wrapper.props().onToggleChangeSelection).toBe('function');
        expect(wrapper.props().onToggleChangeSelection({change: normalChange})).toBe(undefined);
        expect(wrapper.props().onToggleChangeSelection({change: normalChange})).toBe(undefined);
    });

    test('multiple onToggleChangeSelection', () => {
        const EnhancedDiffView = withChangeSelect({multiple: true})(ComponentIn);
        const wrapper = shallow(<EnhancedDiffView hunks={[]} />);
        expect(typeof wrapper.props().onToggleChangeSelection).toBe('function');
        expect(wrapper.props().onToggleChangeSelection({change: normalChange})).toBe(undefined);
        expect(wrapper.props().onToggleChangeSelection({change: normalChange})).toBe(undefined);
    });
});
