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
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        anchorID,
        gutterAnchor,
        gutterAnchorTarget,
        hideGutter
    } = args;

    if (!change) {
        const gutterClassNameValue = classNames('diff-gutter', 'diff-gutter-omit', gutterClassName);
        const codeClassNameValue = classNames('diff-code', 'diff-code-omit', codeClassName);

        return [
            !hideGutter && <td key="gutter" className={gutterClassNameValue} />,
            <td key="code" className={codeClassNameValue} />
        ];
    }

    const {type, content} = change;
    const line = side === SIDE_OLD ? computeOldLineNumber(change) : computeNewLineNumber(change);
    const gutterClassNameValue = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        gutterClassName,
        {'diff-gutter-selected': selected}
    );
    const gutterProps = {
        'id': anchorID,
        'className': gutterClassNameValue,
        'data-line-number': line,
        'children': gutterAnchor ? <a href={'#' + gutterAnchorTarget} data-line-number={line} /> : null,
        ...gutterEvents
    };
    const codeClassNameValue = classNames(
        'diff-code',
        `diff-code-${type}`,
        codeClassName,
        {'diff-code-selected': selected}
    );

    return [
        !hideGutter && <td key="gutter" {...gutterProps} />,
        <CodeCell key="code" className={codeClassNameValue} {...codeEvents} text={content} tokens={tokens} />
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
            className,
            gutterClassName,
            codeClassName,
            gutterEvents,
            codeEvents,
            oldChange,
            newChange,
            oldSelected,
            newSelected,
            oldTokens,
            newTokens,
            monotonous,
            hideGutter,
            generateAnchorID,
            gutterAnchor
        } = this.props;

        const commons = {
            monotonous,
            hideGutter,
            gutterClassName,
            codeClassName,
            gutterEvents,
            codeEvents
        };
        const oldAnchorID = oldChange && generateAnchorID(oldChange);
        const oldArgs = {
            ...commons,
            change: oldChange,
            side: SIDE_OLD,
            selected: oldSelected,
            tokens: oldTokens,
            gutterEvents: this.bindOldGutterEvents(gutterEvents, oldChange),
            codeEvents: this.bindOldCodeEvents(codeEvents, oldChange),
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
            gutterEvents: this.bindNewGutterEvents(gutterEvents, newChange),
            codeEvents: this.bindNewCodeEvents(codeEvents, newChange),
            anchorID: oldChange === newChange ? undefined : newAnchorID,
            gutterAnchor: gutterAnchor,
            gutterAnchorTarget: oldChange === newChange ? oldAnchorID : newAnchorID
        };

        if (monotonous) {
            return (
                <tr className={classNames('diff-line', className)}>
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
            <tr className={classNames('diff-line', lineTypeClassName, className)}>
                {renderCells(oldArgs)}
                {renderCells(newArgs)}
            </tr>
        );
    }
}
