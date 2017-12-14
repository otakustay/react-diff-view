import {PureComponent} from 'react';
import {Icon} from 'antd';
import {bind} from 'lodash-decorators';
import './Unfold.css';

const ICON_TYPE_MAPPING = {
    up: 'caret-up',
    down: 'caret-down',
    none: 'plus-circle'
};

export default class Unfold extends PureComponent {

    @bind()
    expand() {
        const {start, end, onExpand} = this.props;
        onExpand(start, end);
    }

    render() {
        const {start, end, direction} = this.props;
        const iconType = ICON_TYPE_MAPPING[direction];
        const lines = end - start;

        return (
            <div className={`unfold unfold-${direction}`} onClick={this.expand}>
                <Icon type={iconType} />
                &nbsp;Expand hidden {lines} lines
            </div>
        );
    }
}
