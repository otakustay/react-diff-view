import styles from './SubmitButton.less';

interface Props {
    onClick: () => void;
}

export default function SubmitButton({onClick}: Props) {
    return (
        <button type="button" className={styles.root} onClick={onClick}>
            READ THE DIFF
        </button>
    );
}
