import styles from './TextInput.less';

/* eslint-disable react/jsx-no-bind */

interface Props {
    className?: string;
    title: string;
    value: string;
    onChange: (value: string) => void;
}

export default function TextInput({title, value, className, onChange}: Props) {
    return (
        <div className={className}>
            <h3 className={styles.title}>{title}</h3>
            <textarea
                className={styles.input}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
