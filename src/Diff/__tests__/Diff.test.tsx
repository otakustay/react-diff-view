import * as renderer from 'react-test-renderer';
import Diff from '..';
import {Decoration, getChangeKey, HunkType} from '../..';
import {basicHunk} from '../../__tests__/cases';

interface PropsChildren {
    children: (hunks: HunkType[]) => any;
}

function DiffSplit({children}: PropsChildren) {
    return (
        <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'split'}>
            {children}
        </Diff>
    );
}

function DiffUnified({children}: PropsChildren) {
    return (
        <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'unified'}>
            {children}
        </Diff>
    );
}

describe('Diff', () => {
    const renderRawHunks = (hunks: HunkType[]) => <div>{JSON.stringify(hunks)}</div>;

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

const getWidgets = (hunks: HunkType[]) => {
    const changes = hunks.reduce<any[]>((result, {changes}) => [...result, ...changes], []);
    const longLines = changes.filter(({content}) => content.length > 20);
    return longLines.reduce(
        (widgets, change) => {
            const changeKey = getChangeKey(change);

            return {
                ...widgets,
                [changeKey]: <span className="error">Line too long</span>,
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
