import {useState, useMemo} from 'react';
import {uniqueId} from 'lodash';
import sha from 'sha1';
import {parseDiff} from 'react-diff-view';
import {Provider as ConfigurationProvider} from '../../context/configuration';
import DiffView from '../DiffView';
import Configuration from '../Configuration';
import InputArea from '../InputArea';
import styles from './index.less';
import './app.global.less';
import './antd.global.less';

const fakeIndex = () => sha(uniqueId()).slice(0, 9);

const App = () => {
    const [{diff, source}, setData] = useState({diff: '', source: ''});
    const file = useMemo(
        () => {
            if (!diff) {
                return null;
            }

            const segments = [
                'diff --git a/a b/b',
                `index ${fakeIndex()}..${fakeIndex()} 100644`,
                diff,
            ];
            const [file] = parseDiff(segments.join('\n'), {nearbySequences: 'zip'});
            return file;
        },
        [diff]
    );

    return (
        <ConfigurationProvider>
            <div className={styles.root}>
                <InputArea onSubmit={setData} />
                {
                    file && (
                        <>
                            <Configuration />
                            <DiffView
                                key={sha(diff) + (source ? sha(source) : '')}
                                type={file.type}
                                hunks={file.hunks}
                                oldSource={source}
                            />
                        </>
                    )
                }
            </div>
        </ConfigurationProvider>
    );
};

export default App;
