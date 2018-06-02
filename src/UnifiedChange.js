/* eslint-disable no-empty-function */
import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {computeOldLineNumber, computeNewLineNumber} from './utils';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import {createEventsBindingSelector} from './selectors';
import './Change.css';

const GutterCell = ({hide, className, lineNumber, gutterAnchor, anchorID, ...props}) => {
    if (hide) {
        return null;
    }

    return (
        <td className={className} data-line-number={lineNumber} {...props}>
            {gutterAnchor ? <a href={'#' + anchorID} data-line-number={lineNumber} /> : null}
        </td>
    );
};

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
        customClassNames: {},
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
        const {
            change,
            selected,
            customClassNames,
            customEvents,
            hideGutter,
            gutterAnchor,
            generateAnchorID
        } = this.props;
        const {type, content} = change;
        const oldLine = computeOldLineNumber(change);
        const oldLineNumber = oldLine === -1 ? undefined : oldLine;
        const newLine = computeNewLineNumber(change);
        const newLineNumber = newLine === -1 ? undefined : newLine;

        const boundGutterEvents = this.bindGutterEvents(customEvents.gutter, change);
        const boundCodeEvents = this.bindCodeEvents(customEvents.code, change);

        const anchorID = generateAnchorID(change);
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
                id={anchorID}
                className={classNames('diff-line', customClassNames.line)}
                ref={container => (this.container = container)}
            >
                <GutterCell
                    hide={hideGutter}
                    className={gutterClassName}
                    lineNumber={oldLineNumber}
                    gutterAnchor={gutterAnchor}
                    anchorID={anchorID}
                    {...boundGutterEvents}
                />
                <GutterCell
                    hide={hideGutter}
                    className={gutterClassName}
                    lineNumber={newLineNumber}
                    gutterAnchor={gutterAnchor}
                    anchorID={anchorID}
                    {...boundGutterEvents}
                />
                <td className={codeClassName} {...boundCodeEvents}>{content}</td>
            </tr>
        );
    }
}
