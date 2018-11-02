import renderer from 'react-test-renderer';
import Diff from '..';
import {Decoration, getChangeKey} from '../..';
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

const getWidgets = hunks => {
    const changes = hunks.reduce((result, {changes}) => [...result, ...changes], []);
    const longLines = changes.filter(({content}) => content.length > 20);
    return longLines.reduce(
        (widgets, change) => {
            const changeKey = getChangeKey(change);

            return {
                ...widgets,
                [changeKey]: <span className="error">Line too long</span>
            };
        },
        {}
    );
};

describe('Diff with Widget', () => {
    test('split widget', () => {
        const hunks = [basicHunk];
        expect(renderer.create(
            <Diff hunks={hunks} widgets={getWidgets(hunks)} diffType="modify" viewType="split" />
        ).toJSON()).toMatchSnapshot();
    });

    test('unified widget', () => {
        const hunks = [basicHunk];
        expect(renderer.create(
            <Diff hunks={hunks} widgets={getWidgets(hunks)} diffType="modify" viewType="unified" />
        ).toJSON()).toMatchSnapshot();
    });
});
