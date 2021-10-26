import {Modal, Radio, Switch} from 'antd';
import styles from './OptionsModal.less';

/* eslint-disable react/jsx-no-bind */

const {Group: RadioGroup, Button: RadioButton} = Radio;

const Row = ({title, tooltip, children}) => (
    <div className={styles.row}>
        <div className={styles.field}>
            <span className={styles.rowTitle}>
                {title}
            </span>
            {children}
        </div>
        <div className={styles.tooltip}>
            {tooltip}
        </div>
    </div>
);

const OptionsModal = props => {
    const {
        visible,
        viewType,
        editsType,
        showGutter,
        onSwitchViewType,
        onSwitchEditsType,
        onSwitchGutterVisibility,
        onClose,
    } = props;

    return (
        <Modal visible={visible} title="DIFF OPTIONS" footer={null} onCancel={onClose}>
            <Row title="View Mode" tooltip="You can choose to view diff in two columns or a unified column">
                <RadioGroup size="small" value={viewType} onChange={e => onSwitchViewType(e.target.value)}>
                    <RadioButton value="split">Split</RadioButton>
                    <RadioButton value="unified">Unfiied</RadioButton>
                </RadioGroup>
            </Row>
            <Row title="Mark Edits" tooltip="Edits by block usually performs better in programming languages">
                <RadioGroup size="small" value={editsType} onChange={e => onSwitchEditsType(e.target.value)}>
                    <RadioButton value="none">None</RadioButton>
                    <RadioButton value="line">Line</RadioButton>
                    <RadioButton value="block">Block</RadioButton>
                </RadioGroup>
            </Row>
            <Row title="Show Line Number" tooltip="Choose to show or hide line number">
                <Switch checked={showGutter} onChange={onSwitchGutterVisibility} />
            </Row>
        </Modal>
    );
};

export default OptionsModal;
