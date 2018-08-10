/* eslint-disable no-empty-function */
import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {computeOldLineNumber, computeNewLineNumber, createEventsBindingSelector} from '../../utils';
import CodeCell from '../CodeCell';
import '../Change.css';

const SIDE_OLD = 0;
const SIDE_NEW = 1;

const renderCells = args => {
    const {
        change,
        side,
        selected,
        tokens,
        customClassNames,
        customEvents,
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
        ...boundCodeEvents
    };

    return [
        !hideGutter && <td key="gutter" {...gutterProps} />,
        <CodeCell key="code" {...codeProps} text={content} tokens={tokens} />
    ];
};

export default class SplitChange extends PureComponent {

    bindOldGutterEvents = createEventsBindingSelector();

    bindNewGutterEvents = createEventsBindingSelector();

    bindOldCodeEvents = createEventsBindingSelector();

    bindNewCodeEvents = createEventsBindingSelector();

    static propTypes = {
        oldSelected: PropTypes.bool.isRequired,
        newSelected: PropTypes.bool.isRequired,
        oldTokens: PropTypes.arrayOf(PropTypes.object),
        newTokens: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        oldTokens: null,
        newTokens: null
    };

    render() {
        const {
            oldChange,
            newChange,
            oldSelected,
            newSelected,
            oldTokens,
            newTokens,
            monotonous,
            customClassNames,
            customEvents,
            hideGutter,
            generateAnchorID,
            gutterAnchor
        } = this.props;

        const commons = {monotonous, hideGutter, customClassNames, customEvents};
        const oldAnchorID = oldChange && generateAnchorID(oldChange);
        const oldArgs = {
            ...commons,
            change: oldChange,
            side: SIDE_OLD,
            selected: oldSelected,
            tokens: oldTokens,
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
            selected: newSelected,
            tokens: newTokens,
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
