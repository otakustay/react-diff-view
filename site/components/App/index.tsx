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

function fakeIndex() {
    return sha(uniqueId()).slice(0, 9);
}

function appendGitDiffHeaderIfNeeded(diffText: string) {
    if (diffText.startsWith('diff --git')) {
        return diffText;
    }

    const segments = [
        'diff --git a/a b/b',
        `index ${fakeIndex()}..${fakeIndex()} 100644`,
        diffText,
    ];
    return segments.join('\n');
}

interface DiffData {
    diff: string;
    source: string | null;
}

export default function App() {
    const [{diff, source}, setData] = useState<DiffData>({diff: '', source: ''});
    const file = useMemo(
        () => {
            if (!diff) {
                return null;
            }

            const [file] = parseDiff(appendGitDiffHeaderIfNeeded(diff), {nearbySequences: 'zip'});
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
                                key={`${sha(diff)}${source ? sha(source) : ''}`}
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
}
