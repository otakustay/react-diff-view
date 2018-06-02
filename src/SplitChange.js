/* eslint-disable no-empty-function */
import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import escape from 'lodash.escape';
import CodeCell from './CodeCell';
import {computeOldLineNumber, computeNewLineNumber} from './utils';
import {createEventsBindingSelector} from './selectors';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import './Change.css';

const SIDE_OLD = 0;
const SIDE_NEW = 1;
const NO_EDITS = [[], []];

const renderCells = args => {
    const {
        change,
        side,
        edits,
        selected,
        customClassNames,
        customEvents,
        onRenderCode,
        bindGutterEvents,
        bindCodeEvents,
        anchorID,
        gutterAnchor,
        gutterAnchorTarget,
        hideGutter
    } = args;

    if (!change) {
        const gutterClassName = classNames('diff-gutter', 'diff-gutter-omit', customClassNames.gutter);
        const codeClassName = classNames('diff-code', 'diff-code-omit', customClassNames.code);

        return [
            !hideGutter && <td key="gutter" className={gutterClassName} />,
            <td key="code" className={codeClassName} />
        ];
    }

    const {type, content} = change;
    const line = side === SIDE_OLD ? computeOldLineNumber(change) : computeNewLineNumber(change);
    const boundGutterEvents = bindGutterEvents(customEvents.gutter, change);
    const gutterClassName = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        customClassNames.gutter,
        {'diff-gutter-selected': selected}
    );
    const gutterProps = {
        id: anchorID,
        'className': gutterClassName,
        'data-line-number': line,
        children: gutterAnchor ? <a href={'#' + gutterAnchorTarget} data-line-number={line} /> : null,
        ...boundGutterEvents
    };
    const boundCodeEvents = bindCodeEvents(customEvents.code, change);
    const codeClassName = classNames(
        'diff-code',
        `diff-code-${type}`,
        customClassNames.code,
        {'diff-code-selected': selected}
    );
    const codeProps = {
        className: codeClassName,
        onRender: onRenderCode,
        ...boundCodeEvents
    };

    if (!edits.length) {
        return [
            !hideGutter && <td key="gutter" {...gutterProps} />,
            <CodeCell key="code" {...codeProps} text={content} />
        ];
    }

    /* eslint-disable no-param-reassign */
    const {html: editMarkedHTML, lastIndex} = edits.reduce(
        (result, [start, length]) => {
            const normalText = content.slice(result.lastIndex, start);
            const editText = content.substr(start, length);

            result.html += escape(normalText) + `<mark class="diff-code-edit">${escape(editText)}</mark>`;
            result.lastIndex = start + length;

            return result;
        },
        {html: '', lastIndex: 0}
    );
    /* eslint-enable no-param-reassign */
    const tailHTML = escape(content.substring(lastIndex));

    return [
        !hideGutter && <td key="gutter" {...gutterProps} />,
        <CodeCell key="code" {...codeProps} html={editMarkedHTML + tailHTML} />
    ];
};

export default class SplitChange extends PureComponent {

    bindOldGutterEvents = createEventsBindingSelector();

    bindNewGutterEvents = createEventsBindingSelector();

    bindOldCodeEvents = createEventsBindingSelector();

    bindNewCodeEvents = createEventsBindingSelector();

    static propTypes = {
        monotonous: PropTypes.bool.isRequired,
        oldChange: changePropType,
        newChange: changePropType,
        oldSelected: PropTypes.bool.isRequired,
        newSelected: PropTypes.bool.isRequired,
        markEdits: PropTypes.func,
        customEvents: eventsPropType,
        customClassNames: classNamesPropType,
        onRenderCode: PropTypes.func
    };

    static defaultProps = {
        oldChange: null,
        newChange: null,
        customEvents: {},
        customClassNames: {},
        markEdits() {
            return NO_EDITS;
        },
        onRenderCode() {
        }
    };

    render() {
        const {
            oldChange,
            newChange,
            oldSelected,
            newSelected,
            monotonous,
            markEdits,
            customClassNames,
            customEvents,
            onRenderCode,
            hideGutter,
            generateAnchorID,
            gutterAnchor
        } = this.props;

        const [oldEdits, newEdits] = markEdits(oldChange, newChange);

        const commons = {monotonous, hideGutter, customClassNames, customEvents, onRenderCode};
        const oldAnchorID = oldChange && generateAnchorID(oldChange);
        const oldArgs = {
            ...commons,
            change: oldChange,
            side: SIDE_OLD,
            edits: oldEdits,
            selected: oldSelected,
            bindGutterEvents: this.bindOldGutterEvents,
            bindCodeEvents: this.bindOldCodeEvents,
            anchorID: oldAnchorID,
            gutterAnchor: gutterAnchor,
            gutterAnchorTarget: oldAnchorID
        };
        const newAnchorID = newChange && generateAnchorID(newChange);
        const newArgs = {
            ...commons,
            change: newChange,
            side: SIDE_NEW,
            edits: newEdits,
            selected: newSelected,
            bindGutterEvents: this.bindNewGutterEvents,
            bindCodeEvents: this.bindNewCodeEvents,
            anchorID: oldChange === newChange ? undefined : newAnchorID,
            gutterAnchor: gutterAnchor,
            gutterAnchorTarget: oldChange === newChange ? oldAnchorID : newAnchorID
        };

        if (monotonous) {
            return (
                <tr className={classNames('diff-line', customClassNames.line)}>
                    {renderCells(oldChange ? oldArgs : newArgs)}
                </tr>
            );
        }

        const lineTypeClassName = ((oldChange, newChange) => {
            if (oldChange && !newChange) {
                return 'diff-line-old-only';
            }

            if (!oldChange && newChange) {
                return 'diff-line-new-only';
            }

            if (oldChange === newChange) {
                return 'diff-line-normal';
            }

            return 'diff-line-compare';
        })(oldChange, newChange);

        return (
            <tr className={classNames('diff-line', customClassNames.line, lineTypeClassName)}>
                {renderCells(oldArgs)}
                {renderCells(newArgs)}
            </tr>
        );
    }
}
