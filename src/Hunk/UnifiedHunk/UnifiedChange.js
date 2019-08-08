/* eslint-disable no-empty-function */
import {memo, useMemo} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import {computeOldLineNumber, computeNewLineNumber} from '../../utils';
import CodeCell from '../CodeCell';
import '../Change.css';

const useBoundCallbacks = (callbacks, arg) => useMemo(
    () => mapValues(callbacks, fn => () => fn(arg)),
    [callbacks, arg]
);

const renderGutterCell = (className, lineNumber, gutterAnchor, anchorID, events) => (
    <td className={className} {...events}>
        {
            gutterAnchor
                ? <a href={'#' + anchorID} data-line-number={lineNumber}>{lineNumber}</a>
                : lineNumber
        }
    </td>
);

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
    } = props;
    const {type, content} = change;
    const oldLine = computeOldLineNumber(change);
    const oldLineNumber = oldLine === -1 ? undefined : oldLine;
    const newLine = computeNewLineNumber(change);
    const newLineNumber = newLine === -1 ? undefined : newLine;

    const eventArg = useMemo(() => ({change}), [change]);
    const boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg);
    const boundCodeEvents = useBoundCallbacks(codeEvents, eventArg);

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
                    oldLineNumber,
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents
                )
            }
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    newLineNumber,
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents
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
