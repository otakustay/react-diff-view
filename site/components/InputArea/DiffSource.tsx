import {useState, useCallback} from 'react';
import classNames from 'classnames';
import {formatLines, diffLines} from 'unidiff';
import InteractiveLabel from '../InteractiveLabel';
import TextInput from './TextInput';
import SubmitButton from './SubmitButton';
import styles from './DiffSource.less';

interface DiffData {
    diff: string;
    source: string | null;
}

export interface Props {
    className?: string;
    onSubmit: (data: DiffData) => void;
    onSwitchInputType: () => void;
}

export default function DiffSource({className, onSubmit, onSwitchInputType}: Props) {
    const [oldSource, setOldSource] = useState('');
    const [newSource, setNewSource] = useState('');
    const submit = useCallback(
        () => {
            if (!oldSource || !newSource) {
                return;
            }

            const diffText = formatLines(diffLines(oldSource, newSource), {context: 3});
            const data = {
                diff: diffText,
                source: oldSource,
            };

            onSubmit(data);
        },
        [oldSource, newSource, onSubmit]
    );

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles.action}>
                <InteractiveLabel onClick={onSwitchInputType}>I want to beautify a diff</InteractiveLabel>
            </div>
            <div className={styles.input}>
                <TextInput
                    className={styles.inputText}
                    title="ORIGINAL TEXT"
                    value={oldSource}
                    onChange={setOldSource}
                />
                <TextInput
                    className={styles.inputText}
                    title="CHANGED TEXT"
                    value={newSource}
                    onChange={setNewSource}
                />
            </div>
            <SubmitButton onClick={submit} />
        </div>
    );
}
