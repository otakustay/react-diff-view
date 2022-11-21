import {useState, useReducer, useCallback} from 'react';
import classNames from 'classnames';
import {UpOutlined, DownOutlined} from '@ant-design/icons';
import TextInput from './TextInput';
import SubmitButton from './SubmitButton';
import styles from './DiffText.less';
import preset from './preset.diff?raw';
import presetSource from './preset.src?raw';

const useToggle = initialValue => useReducer(v => !v, initialValue);

const DiffText = ({className, onSwitchInputType, onSubmit}) => {
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
                <a onClick={onSwitchInputType}>I want to compare text</a>
                <a onClick={loadPreset}>Use preset example</a>
            </div>
            <TextInput title="DIFF TEXT" value={diff} onChange={setDiff} />
            <div className={styles.source}>
                <a className={styles.toggle} onClick={toggleSourceVisible}>
                    {isSourceVisible ? <UpOutlined /> : <DownOutlined />}
                    {isSourceVisible ? 'Don\'t have any source code' : 'I have the old source code'}
                </a>
                <TextInput
                    className={isSourceVisible ? null : styles.hidden}
                    title="ORIGINAL SOURCE CODE"
                    value={source}
                    onChange={setSource}
                />
            </div>
            <SubmitButton onClick={submit} />
        </div>
    );
};

export default DiffText;
