import {ReactNode} from 'react';
import {Modal, Radio, Switch} from 'antd';
import styles from './OptionsModal.less';
import {MarkEditsType, ViewType} from 'react-diff-view';

/* eslint-disable react/jsx-no-bind */

const {Group: RadioGroup, Button: RadioButton} = Radio;

interface RowProps {
    title: string;
    tooltip: string;
    children: ReactNode;
}

function Row({title, tooltip, children}: RowProps) {
    return (
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
}

interface Props {
    visible: boolean;
    viewType: ViewType;
    editsType: MarkEditsType;
    showGutter: boolean;
    onSwitchViewType: (value: ViewType) => void;
    onSwitchEditsType: (value: MarkEditsType) => void;
    onSwitchGutterVisibility: (value: boolean) => void;
    onClose: () => void;
}

export default function OptionsModal(props: Props) {
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
}
