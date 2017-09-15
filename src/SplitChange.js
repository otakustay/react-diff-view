import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {diffChars, diffWordsWithSpace} from 'diff';
import leven from 'leven';
import escape from 'lodash.escape';
import CodeCell from './CodeCell';
import {computeOldLineNumber, computeNewLineNumber} from './utils';
import {createEventsBindingSelector} from './selectors';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import './Change.css';

const SIDE_OLD = 0;

const renderCells = args => {
    const {
        change,
        diff,
        side,
        selected,
        customClassNames,
        customEvents,
        onRenderCode,
        bindGutterEvents,
        bindCodeEvents
    } = args;

    if (!change) {
        return [
            <td key="gutter" className={classNames('diff-gutter', 'diff-gutter-omit', customClassNames.gutter)} />,
            <td key="code" className={classNames('diff-code', 'diff-code-omit', customClassNames.code)} />
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
        'key': 'gutter',
        'className': gutterClassName,
        'data-line-number': line,
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
        key: 'code',
        className: codeClassName,
        onRender: onRenderCode,
        ...boundCodeEvents
    };

    if (!diff || diff.length <= 1) {
        return [
            <td {...gutterProps} />,
            <CodeCell {...codeProps} text={content.substring(1)} />
        ];
    }

    const discardingDiffType = side === SIDE_OLD ? 'added' : 'removed';
    const usefulDiff = diff.filter(item => !item[discardingDiffType]);
    const html = usefulDiff.reduce(
        (html, {added, removed, value}) => {
            if (!added && !removed) {
                return html += escape(value);
            }

            return html += `<span class="diff-column-text">${escape(value)}</span>`;
        },
        ''
    );

    return [
        <td {...gutterProps} />,
        <CodeCell {...codeProps} html={html} />
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
        columnDiff: PropTypes.bool,
        columnDiffMode: PropTypes.oneOf(['character', 'word']),
        columnDiffThreshold: PropTypes.number,
        longDistanceColumnDiff: PropTypes.oneOf(['ignore', 'mark']),
        customEvents: eventsPropType,
        customClassNames: classNamesPropType,
        onRenderCode: PropTypes.func
    };

    static defaultProps = {
        columnDiff: true,
        columnDiffMode: 'word',
        columnDiffThreshold: 20,
        longDistanceColumnDiff: 'ignore',
        customEvents: {},
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
            columnDiff,
            columnDiffMode,
            columnDiffThreshold,
            longDistanceColumnDiff,
            customClassNames,
            customEvents,
            onRenderCode
        } = this.props;

        const diff = (() => {
            if (!columnDiff || !oldChange || !newChange) {
                return null;
            }

            // Precheck `columnDiffThreshold !== Infinity` to reduce calls to `leven`
            if (columnDiffThreshold !== Infinity && leven(oldChange.content, newChange.content) > columnDiffThreshold) {
                // Mark the whole line as column diff to highlight "this line is completely changed"
                if (longDistanceColumnDiff === 'mark') {
                    return [
                        {removed: true, value: oldChange.content.substring(1)},
                        {added: true, value: newChange.content.substring(1)}
                    ];
                }

                return null;
            }

            const diffFunction = columnDiffMode === 'word' ? diffWordsWithSpace : diffChars;
            return diffFunction(oldChange.content.substring(1), newChange.content.substring(1));
        })();

        const commons = {diff, monotonous, customClassNames, customEvents, onRenderCode};
        const oldArgs = {
            ...commons,
            change: oldChange,
            side: 0,
            selected: oldSelected,
            bindGutterEvents: this.bindOldGutterEvents,
            bindCodeEvents: this.bindOldCodeEvents
        };
        const newArgs = {
            ...commons,
            change: newChange,
            side: 1,
            selected: newSelected,
            bindGutterEvents: this.bindNewGutterEvents,
            bindCodeEvents: this.bindNewCodeEvents
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
