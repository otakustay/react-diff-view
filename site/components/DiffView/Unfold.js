import {useCallback} from 'react';
import {Icon} from 'antd';
import {Decoration} from 'react-diff-view';
import styles from './Unfold.less';

const ICON_TYPE_MAPPING = {
    up: 'caret-up',
    down: 'caret-down',
    none: 'plus-circle',
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
                <Icon type={iconType} />
                &nbsp;Expand hidden {lines} lines
            </div>
        </Decoration>
    );
};

export default Unfold;
