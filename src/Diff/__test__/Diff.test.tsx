import {describe, test, expect} from 'vitest';
import dedent from 'dedent';
import renderer from 'react-test-renderer';
import Diff, {DiffProps} from '../index';
import Decoration from '../../Decoration';
import {getChangeKey, HunkData, parseDiff} from '../../utils';

const sample = dedent`
    diff --git a/src/__test__/index.test.jsx b/src/__test__/index.test.jsx
    index 643c2f0..7883597 100644
    --- a/src/__test__/index.test.jsx
    +++ b/src/__test__/index.test.jsx
    @@ -21,3 +21,3 @@ describe('basic test', () => {
         test('App renders correctly', () => {
    -        expect(renderer.create(<App diffText={'deff'} />).toJSON()).toMatchSnapshot();
    +        expect(renderer.create(<App diffText={'diff'} />).toJSON()).toMatchSnapshot();
         });
`;

const [file] = parseDiff(sample);

interface Props {
    children: DiffProps['children'];
}

function DiffSplit({children}: Props) {
    return (
        <Diff diffType="modify" hunks={file.hunks} viewType={'split'}>
            {children}
        </Diff>
    );
}

function DiffUnified({children}: Props) {
    return (
        <Diff diffType="modify" hunks={file.hunks} viewType={'unified'}>
            {children}
        </Diff>
    );
}

describe('Diff', () => {
    const renderRawHunks = (hunks: HunkData[]) => <div>{JSON.stringify(hunks)}</div>;

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

const getWidgets = (hunks: HunkData[]) => {
    const changes = hunks.flatMap(v => v.changes);
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
        const result = renderer.create(
            <Diff hunks={file.hunks} widgets={getWidgets(file.hunks)} diffType="modify" viewType="split" />
        );
        expect(result.toJSON()).toMatchSnapshot();
    });

    test('unified widget', () => {
        const result = renderer.create(
            <Diff hunks={file.hunks} widgets={getWidgets(file.hunks)} diffType="modify" viewType="unified" />
        );
        expect(result.toJSON()).toMatchSnapshot();
    });
});
