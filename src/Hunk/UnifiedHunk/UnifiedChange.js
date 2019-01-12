/* eslint-disable no-empty-function */
import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {computeOldLineNumber, computeNewLineNumber, createEventsBindingSelector} from '../../utils';
import CodeCell from '../CodeCell';
import '../Change.css';

const GutterCell = ({hide, className, lineNumber, gutterAnchor, anchorID, ...props}) => {
    if (hide) {
        return null;
    }

    return (
        <td className={className} {...props}>
            {
                gutterAnchor
                    ? <a href={'#' + anchorID} data-line-number={lineNumber}>{lineNumber}</a>
                    : lineNumber
            }
        </td>
    );
};

export default class UnifiedChange extends PureComponent {

    bindGutterEvents = createEventsBindingSelector();

    bindCodeEvents = createEventsBindingSelector();

    static propTypes = {
        selected: PropTypes.bool.isRequired,
        tokens: PropTypes.arrayOf(PropTypes.object),
    };

    static defaultProps = {
        tokens: null,
    };

    render() {
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
        } = this.props;
        const {type, content} = change;
        const oldLine = computeOldLineNumber(change);
        const oldLineNumber = oldLine === -1 ? undefined : oldLine;
        const newLine = computeNewLineNumber(change);
        const newLineNumber = newLine === -1 ? undefined : newLine;

        const eventArg = {change};
        const boundGutterEvents = this.bindGutterEvents(gutterEvents, eventArg);
        const boundCodeEvents = this.bindCodeEvents(codeEvents, eventArg);

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
            <tr
                id={anchorID}
                className={classNames('diff-line', className)}
                ref={container => (this.container = container)}
            >
                <GutterCell
                    hide={hideGutter}
                    className={gutterClassNameValue}
                    lineNumber={oldLineNumber}
                    gutterAnchor={gutterAnchor}
                    anchorID={anchorID}
                    {...boundGutterEvents}
                />
                <GutterCell
                    hide={hideGutter}
                    className={gutterClassNameValue}
                    lineNumber={newLineNumber}
                    gutterAnchor={gutterAnchor}
                    anchorID={anchorID}
                    {...boundGutterEvents}
                />
                <CodeCell
                    className={codeClassNameValue}
                    text={content}
                    tokens={tokens}
                    renderToken={renderToken}
                    {...boundCodeEvents}
                />
            </tr>
        );
    }
}
