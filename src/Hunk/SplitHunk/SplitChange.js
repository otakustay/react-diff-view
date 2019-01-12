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

export default class SplitChange extends PureComponent {

    static propTypes = {
        oldSelected: PropTypes.bool.isRequired,
        newSelected: PropTypes.bool.isRequired,
        oldTokens: PropTypes.arrayOf(PropTypes.object),
        newTokens: PropTypes.arrayOf(PropTypes.object),
    };

    static defaultProps = {
        oldTokens: null,
        newTokens: null,
    };

    state = {
        hover: '',
    };

    constructor(props) {
        super(props);

        const unmarkHover = () => this.setState({hover: ''});
        const markHoverAs = side => () => this.setState({hover: side});
        const ownEventsOnOldSide = {
            onMouseEnter: markHoverAs('old'),
            onMouseLeave: unmarkHover,
        };
        const ownEventsOnNewSide = {
            onMouseEnter: markHoverAs('new'),
            onMouseLeave: unmarkHover,
        };

        this.bindOldGutterEvents = createEventsBindingSelector(ownEventsOnOldSide);
        this.bindNewGutterEvents = createEventsBindingSelector(ownEventsOnNewSide);
        this.bindOldCodeEvents = createEventsBindingSelector(ownEventsOnOldSide);
        this.bindNewCodeEvents = createEventsBindingSelector(ownEventsOnNewSide);
    }

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
            gutterAnchor,
            renderToken,
        } = this.props;
        const {hover} = this.state;

        const commons = {
            monotonous,
            hideGutter,
            gutterClassName,
            codeClassName,
            gutterEvents,
            codeEvents,
            renderToken,
        };
        const oldAnchorID = oldChange && generateAnchorID(oldChange);
        const oldEventArg = {
            change: oldChange,
            side: 'old',
        };
        const oldArgs = {
            ...commons,
            change: oldChange,
            side: SIDE_OLD,
            selected: oldSelected,
            tokens: oldTokens,
            gutterEvents: this.bindOldGutterEvents(gutterEvents, oldEventArg),
            codeEvents: this.bindOldCodeEvents(codeEvents, oldEventArg),
            anchorID: oldAnchorID,
            gutterAnchor: gutterAnchor,
            gutterAnchorTarget: oldAnchorID,
            hover: hover === 'old',
        };
        const newAnchorID = newChange && generateAnchorID(newChange);
        const newEventArg = {
            change: newChange,
            side: 'new',
        };
        const newArgs = {
            ...commons,
            change: newChange,
            side: SIDE_NEW,
            selected: newSelected,
            tokens: newTokens,
            gutterEvents: this.bindNewGutterEvents(gutterEvents, newEventArg),
            codeEvents: this.bindNewCodeEvents(codeEvents, newEventArg),
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
    }
}
