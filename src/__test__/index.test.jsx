import renderer from 'react-test-renderer';
import {parseDiff, Diff, Hunk} from '../index';

const diffTextExample = `
diff --git a/src/__test__/index.test.jsx b/src/__test__/index.test.jsx
index 643c2f0..7883597 100644
--- a/src/__test__/index.test.jsx
+++ b/src/__test__/index.test.jsx
@@ -21,3 +21,3 @@ describe('basic test', () => {
     test('App renders correctly', () => {
-        expect(renderer.create(<App diffText={'deff'} />).toJSON()).toMatchSnapshot();
+        expect(renderer.create(<App diffText={'diff'} />).toJSON()).toMatchSnapshot();
     });
`

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
        expect(renderer.create(<App diffText={diffTextExample} />).toJSON()).toMatchSnapshot();
    });
});
