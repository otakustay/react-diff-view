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
        <td className={className} data-line-number={lineNumber} {...props}>
            {gutterAnchor ? <a href={'#' + anchorID} data-line-number={lineNumber} /> : null}
        </td>
    );
};

export default class UnifiedChange extends PureComponent {


    bindGutterEvents = createEventsBindingSelector();

    bindCodeEvents = createEventsBindingSelector();

    static propTypes = {
        selected: PropTypes.bool.isRequired,
        tokens: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        tokens: null
    };

    render() {
        const {
            change,
            selected,
            tokens,
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
                <CodeCell className={codeClassName} text={content} tokens={tokens} {...boundCodeEvents} />
            </tr>
        );
    }
}
