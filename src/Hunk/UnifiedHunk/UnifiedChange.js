/* eslint-disable no-empty-function */
import {memo, useState, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import CodeCell from '../CodeCell';
import {composeCallback, renderDefaultBy, wrapInAnchorBy} from '../utils';
import '../Change.css';

const useBoundCallbacks = (callbacks, arg, hoverOn, hoverOff) => useMemo(
    () => {
        const output = mapValues(callbacks, fn => () => fn(arg));
        output.onMouseEnter = composeCallback(hoverOn, output.onMouseEnter);
        output.onMouseLeave = composeCallback(hoverOff, output.onMouseLeave);
        return output;
    },
    [callbacks, arg]
);

const useBoolean = () => {
    const [value, setValue] = useState(false);
    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);
    return [value, on, off];
};

const renderGutterCell = (className, change, side, gutterAnchor, anchorTarget, events, inHoverState, renderGutter) => {
    const gutterOptions = {
        change,
        side,
        inHoverState,
        renderDefault: renderDefaultBy(change, side),
        wrapInAnchor: wrapInAnchorBy(gutterAnchor, anchorTarget),
    };

    return (
        <td className={className} {...events}>
            {renderGutter(gutterOptions)}
        </td>
    );
};

const UnifiedChange = props => {
    const {
        change,
        selected,
        tokens,
        className,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        hideGutter,
        gutterAnchor,
        generateAnchorID,
        renderToken,
        renderGutter,
    } = props;
    const {type, content} = change;

    const [hover, hoverOn, hoverOff] = useBoolean();
    const eventArg = useMemo(() => ({change}), [change]);
    const boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg, hoverOn, hoverOff);
    const boundCodeEvents = useBoundCallbacks(codeEvents, eventArg, hoverOn, hoverOff);

    const anchorID = generateAnchorID(change);
    const gutterClassNameValue = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        gutterClassName,
        {'diff-gutter-selected': selected}
    );
    const codeClassNameValue = classNames(
        'diff-code',
        `diff-code-${type}`,
        codeClassName,
        {'diff-code-selected': selected}
    );

    return (
        <tr id={anchorID} className={classNames('diff-line', className)}>
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    'old',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter
                )
            }
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    'new',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter
                )
            }
            <CodeCell
                className={codeClassNameValue}
                text={content}
                tokens={tokens}
                renderToken={renderToken}
                {...boundCodeEvents}
            />
        </tr>
    );
};


UnifiedChange.propTypes = {
    selected: PropTypes.bool.isRequired,
    tokens: PropTypes.arrayOf(PropTypes.object),
};

UnifiedChange.defaultProps = {
    tokens: null,
};

export default memo(UnifiedChange);
