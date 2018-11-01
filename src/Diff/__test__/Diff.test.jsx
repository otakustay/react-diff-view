import renderer from 'react-test-renderer';
import Diff from '..';
import Decoration from '../../Decoration';
import {basicHunk} from '../../__test__/cases';

const DiffSplit = ({children}) => (
    <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'split'}>
        {children}
    </Diff>
);

const DiffUnified = ({children}) => (
    <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'unified'}>
        {children}
    </Diff>
);

// TODO it's weird that children should be a function
describe('Diff', () => {
    const renderRawHunks = hunks => <div>{JSON.stringify(hunks)}</div>;

    test('renders correctly', () => {
        expect(renderer.create(<DiffSplit>{renderRawHunks}</DiffSplit>).toJSON()).toMatchSnapshot();
    });

    test('unified Diff', () => {
        expect(renderer.create(<DiffUnified>{renderRawHunks}</DiffUnified>).toJSON()).toMatchSnapshot();
    });
});


describe('Diff with Decoration', () => {
    const renderDecoration = () => <Decoration><div>xxx</div></Decoration>;

    test('renders correctly', () => {
        expect(renderer.create(<DiffSplit>{renderDecoration}</DiffSplit>).toJSON()).toMatchSnapshot();
    });

    test('unified Diff with Decoration', () => {
        expect(renderer.create(<DiffUnified>{renderDecoration}</DiffUnified>).toJSON()).toMatchSnapshot();
    });
});
