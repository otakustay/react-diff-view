import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {computeOldLineNumber, computeNewLineNumber} from './utils';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import {createEventsBindingSelector} from './selectors';
import './Change.css';

export default class UnifiedChange extends PureComponent {


    bindGutterEvents = createEventsBindingSelector();

    bindCodeEvents = createEventsBindingSelector();

    static propTypes = {
        change: changePropType.isRequired,
        selected: PropTypes.bool.isRequired,
        customEvents: eventsPropType,
        customClassNames: classNamesPropType,
        onRenderCode: PropTypes.func
    };

    static defaultProps = {
        customEvents: {},
        onRenderCode() {
        }
    };

    componentDidMount() {
        const {change, onRenderCode} = this.props;
        const cell = this.container.querySelector('.diff-code');
        onRenderCode(cell, change);
    }

    componentDidUpdate() {
        // TODO: 如何判断一个td里的代码是不是已经高亮过了？
    }

    render() {
        const {change, selected, customClassNames, customEvents} = this.props;
        const {type, isInsert, isDelete, content} = change;
        const oldLine = computeOldLineNumber(change);
        const newLine = computeNewLineNumber(change);

        const boundGutterEvents = this.bindGutterEvents(customEvents.gutter, change);
        const boundCodeEvents = this.bindCodeEvents(customEvents.code, change);

        const gutterClassName = classNames(
            'diff-gutter',
            `diff-gutter-${type}`,
            customClassNames.gutter,
            {'diff-gutter-selected': selected}
        );
        const codeClassName = classNames(
            'diff-code',
            `diff-code-${type}`,
            customClassNames.code,
            {'diff-code-selected': selected}
        );

        return (
            <tr
                className={classNames('diff-line', customClassNames.line)}
                ref={container => this.container = container}
            >
                <td className={gutterClassName} {...boundGutterEvents}>{!isInsert && oldLine}</td>
                <td className={gutterClassName} {...boundGutterEvents}>{!isDelete && newLine}</td>
                <td className={codeClassName} {...boundCodeEvents}>{content}</td>
            </tr>
        );
    }
}
