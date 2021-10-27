import styles from './SubmitButton.less';

const SubmitButton = ({onClick}) => (
    <button type="button" className={styles.root} onClick={onClick}>
        READ THE DIFF
    </button>
);

export default SubmitButton;
