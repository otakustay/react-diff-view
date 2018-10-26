import renderer from 'react-test-renderer';
import {parseDiff, Diff, Hunk} from '../index';
import {basic, multiple} from './cases';

const App = ({diffText}) => {
    const files = parseDiff(diffText);

    const renderFile = ({oldRevision, newRevision, type, hunks}) => (
        <Diff key={oldRevision + '-' + newRevision} viewType="split" diffType={type} hunks={hunks}>
            {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
    );

    return (
        <div>
            {files.map(renderFile)}
        </div>
    );
};

describe('basic test', () => {
    test('App renders correctly', () => {
        expect(renderer.create(<App diffText={basic} />).toJSON()).toMatchSnapshot();
    });

    test('multiple diff', () => {
        expect(renderer.create(<App diffText={multiple} />).toJSON()).toMatchSnapshot();
    });
});
