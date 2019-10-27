import styles from './TextInput.less';

/* eslint-disable react/jsx-no-bind */

const TextInput = ({title, value, className, onChange}) => (
    <div className={className}>
        <h3 className={styles.title}>{title}</h3>
        <textarea
            className={styles.input}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </div>
);

export default TextInput;
