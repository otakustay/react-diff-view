import {createElement, useCallback} from 'react';
import {CaretUpOutlined, CaretDownOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Decoration} from 'react-diff-view';
import styles from './Unfold.less';

const ICON_TYPE_MAPPING = {
    up: CaretUpOutlined,
    down: CaretDownOutlined,
    none: PlusCircleOutlined,
};

const Unfold = ({start, end, direction, onExpand, ...props}) => {
    const expand = useCallback(
        () => onExpand(start, end),
        [onExpand, start, end]
    );

    const iconType = ICON_TYPE_MAPPING[direction];
    const lines = end - start;

    return (
        <Decoration {...props}>
            <div className={styles.root} onClick={expand}>
                {createElement(iconType)}
                &nbsp;Expand hidden {lines} lines
            </div>
        </Decoration>
    );
};

export default Unfold;
