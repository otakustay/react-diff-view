/* eslint-disable no-empty-function */
import {memo, useState, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import {computeOldLineNumber, computeNewLineNumber} from '../../utils';
import CodeCell from '../CodeCell';
import '../Change.css';

const SIDE_OLD = 0;
const SIDE_NEW = 1;

const useCallbackOnSide = (side, setHover, change, customCallbacks) => {
    const markHover = useCallback(() => setHover(side), []);
    const unmarkHover = useCallback(() => setHover(''), []);
    const arg = {side, change};
    const composeCallback = (own, custom) => {
        if (custom) {
            return e => {
                own(e);
                custom(); // `custom` is already bound with `arg`
            };
        }

        return own;
    };
    // Unlike selectors, hooks do not provide native functionality to customize comparator,
    // on realizing that this does not reduce amount of renders, only preventing duplicate merge computations,
    // we decide not to optimize this extremely, leave it recomputed on certain rerenders.
    const callbacks = useMemo(
        () => {
            const callbacks = mapValues(customCallbacks, fn => () => fn(arg));
            callbacks.onMouseEnter = composeCallback(markHover, callbacks.onMouseEnter);
            callbacks.onMouseLeave = composeCallback(unmarkHover, callbacks.onMouseLeave);
            return callbacks;
        },
        [change, customCallbacks]
    );
    return callbacks;
};

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
        hideGutter,
        hover,
        renderToken,
    } = args;

    if (!change) {
        const gutterClassNameValue = classNames('diff-gutter', 'diff-gutter-omit', gutterClassName);
        const codeClassNameValue = classNames('diff-code', 'diff-code-omit', codeClassName);

        return [
            !hideGutter && <td key="gutter" className={gutterClassNameValue} />,
            <td key="code" className={codeClassNameValue} />,
        ];
    }

    const {type, content} = change;
    const line = side === SIDE_OLD ? computeOldLineNumber(change) : computeNewLineNumber(change);
    const sideName = side === SIDE_OLD ? 'old' : 'new';
    const gutterClassNameValue = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        {
            'diff-gutter-selected': selected,
            ['diff-line-hover-' + sideName]: hover,
        },
        gutterClassName
    );
    const gutterProps = {
        'id': anchorID,
        'className': gutterClassNameValue,
        'children': gutterAnchor ? <a href={'#' + gutterAnchorTarget}>{line}</a> : line.toString(),
        ...gutterEvents,
    };
    const codeClassNameValue = classNames(
        'diff-code',
        `diff-code-${type}`,
        {
            'diff-code-selected': selected,
            ['diff-line-hover-' + sideName]: hover,
        },
        codeClassName
    );

    return [
        !hideGutter && <td key="gutter" {...gutterProps} />,
        <CodeCell
            key="code"
            className={codeClassNameValue}
            text={content}
            tokens={tokens}
            renderToken={renderToken}
            {...codeEvents}
        />,
    ];
};

const SplitChange = props => {
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
        gutterAnchor,
        renderToken,
    } = props;

    const [hover, setHover] = useState('');
    const oldGutterEvents = useCallbackOnSide('old', setHover, oldChange, gutterEvents);
    const newGutterEvents = useCallbackOnSide('new', setHover, newChange, gutterEvents);
    const oldCodeEvents = useCallbackOnSide('old', setHover, oldChange, codeEvents);
    const newCodeEvents = useCallbackOnSide('new', setHover, newChange, codeEvents);
    const oldAnchorID = oldChange && generateAnchorID(oldChange);
    const newAnchorID = newChange && generateAnchorID(newChange);
    const commons = {
        monotonous,
        hideGutter,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        renderToken,
    };
    const oldArgs = {
        ...commons,
        change: oldChange,
        side: SIDE_OLD,
        selected: oldSelected,
        tokens: oldTokens,
        gutterEvents: oldGutterEvents,
        codeEvents: oldCodeEvents,
        anchorID: oldAnchorID,
        gutterAnchor: gutterAnchor,
        gutterAnchorTarget: oldAnchorID,
        hover: hover === 'old',
    };
    const newArgs = {
        ...commons,
        change: newChange,
        side: SIDE_NEW,
        selected: newSelected,
        tokens: newTokens,
        gutterEvents: newGutterEvents,
        codeEvents: newCodeEvents,
        anchorID: oldChange === newChange ? undefined : newAnchorID,
        gutterAnchor: gutterAnchor,
        gutterAnchorTarget: oldChange === newChange ? oldAnchorID : newAnchorID,
        hover: hover === 'new',
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
};


SplitChange.propTypes = {
    oldSelected: PropTypes.bool.isRequired,
    newSelected: PropTypes.bool.isRequired,
    oldTokens: PropTypes.arrayOf(PropTypes.object),
    newTokens: PropTypes.arrayOf(PropTypes.object),
};

SplitChange.defaultProps = {
    oldTokens: null,
    newTokens: null,
};

export default memo(SplitChange);
