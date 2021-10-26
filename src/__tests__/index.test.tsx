import * as renderer from 'react-test-renderer';
import {parseDiff, Diff, Hunk, DiffType} from '..';
import {basic, multiple} from './cases';

interface Props {
    diffText: string;
    viewType?: 'split' | 'unified';
}

function App({diffText, viewType = 'split'}: Props) {
    const files = parseDiff(diffText);

    const renderFile = ({oldRevision, newRevision, type, hunks}: DiffType) => (
        <Diff key={oldRevision + '-' + newRevision} viewType={viewType} diffType={type} hunks={hunks}>
            {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
    );

    return (
        <div>
            {files.map(renderFile)}
        </div>
    );
}

describe('App with viewType === split', () => {
    test('renders correctly', () => {
        expect(renderer.create(<App diffText={basic} />).toJSON()).toMatchSnapshot();
    });

    test('multiple diff', () => {
        expect(renderer.create(<App diffText={multiple} />).toJSON()).toMatchSnapshot();
    });
});

describe('App with viewType === unified', () => {
    test('renders correctly', () => {
        expect(renderer.create(<App diffText={basic} viewType="unified" />).toJSON()).toMatchSnapshot();
    });

    test('multiple diff', () => {
        expect(renderer.create(<App diffText={multiple} viewType="unified" />).toJSON()).toMatchSnapshot();
    });
});
