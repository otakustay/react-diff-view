import {useState, useReducer, useCallback} from 'react';
import classNames from 'classnames';
import {UpOutlined, DownOutlined} from '@ant-design/icons';
import InteractiveLabel from '../InteractiveLabel';
import TextInput from './TextInput';
import SubmitButton from './SubmitButton';
import styles from './DiffText.less';
import preset from './preset.diff?raw';
import presetSource from './preset.src?raw';

function useToggle(initialValue: boolean) {
    return useReducer(v => !v, initialValue);
}

interface DiffData {
    diff: string;
    source: string | null;
}

interface Props {
    className?: string;
    onSwitchInputType: () => void;
    onSubmit: (data: DiffData) => void;
}


export default function DiffText({className, onSwitchInputType, onSubmit}: Props) {
    const [diff, setDiff] = useState('');
    const [source, setSource] = useState('');
    const [isSourceVisible, toggleSourceVisible] = useToggle(false);
    const submit = useCallback(
        () => {
            const data = {
                diff: diff,
                source: (isSourceVisible && source) ? source : null,
            };

            onSubmit(data);
        },
        [diff, isSourceVisible, source, onSubmit]
    );
    const loadPreset = useCallback(
        () => {
            setDiff(preset);
            setSource(presetSource);
            onSubmit({diff: preset, source: presetSource});
        },
        [onSubmit]
    );

    return (
        <div className={classNames(styles.root, className)}>
            <div className={styles.action}>
                <InteractiveLabel onClick={onSwitchInputType}>I want to compare text</InteractiveLabel>
                <InteractiveLabel onClick={loadPreset}>Use preset example</InteractiveLabel>
            </div>
            <TextInput title="DIFF TEXT" value={diff} onChange={setDiff} />
            <div className={styles.source}>
                <InteractiveLabel className={styles.toggle} onClick={toggleSourceVisible}>
                    {isSourceVisible ? <UpOutlined /> : <DownOutlined />}
                    {isSourceVisible ? 'Don\'t have any source code' : 'I have the old source code'}
                </InteractiveLabel>
                <TextInput
                    className={isSourceVisible ? '' : styles.hidden}
                    title="ORIGINAL SOURCE CODE"
                    value={source}
                    onChange={setSource}
                />
            </div>
            <SubmitButton onClick={submit} />
        </div>
    );
}
