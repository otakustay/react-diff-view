import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {diffChars, diffWordsWithSpace} from 'diff';
import leven from 'leven';
import escape from 'lodash.escape';
import CodeCell from './CodeCell';
import {computePrevLineNumber, computeNextLineNumber} from './utils';
import {createEventsBindingSelector} from './selectors';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import './Change.css';

const PREV = 0;

const renderCells = args => {
    const {
        change,
        diff,
        changePositionType,
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
            <CodeCell
                key="code"
                className={classNames('diff-code', 'diff-code-omit', customClassNames.code)}
                onRender={onRenderCode}
            />
        ];
    }

    const {type, content} = change;
    const line = changePositionType === PREV ? computePrevLineNumber(change) : computeNextLineNumber(change);
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

    const discardingDiffType = changePositionType === PREV ? 'added' : 'removed';
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

    bindPrevGutterEvents = createEventsBindingSelector();

    bindNextGutterEvents = createEventsBindingSelector();

    bindPrevCodeEvents = createEventsBindingSelector();

    bindNextCodeEvents = createEventsBindingSelector();

    static propTypes = {
        prev: changePropType,
        next: changePropType,
        prevSelected: PropTypes.bool.isRequired,
        nextSelected: PropTypes.bool.isRequired,
        columnDiff: PropTypes.bool,
        columnDiffMode: PropTypes.oneOf(['character', 'word']),
        columnDiffThreshold: PropTypes.number,
        customEvents: eventsPropType,
        customClassNames: classNamesPropType,
        onRenderCode: PropTypes.func
    };

    static defaultProps = {
        columnDiff: true,
        columnDiffMode: 'word',
        columnDiffThreshold: 20,
        customEvents: {},
        onRenderCode() {
        }
    };

    render() {
        const {
            prev,
            next,
            prevSelected,
            nextSelected,
            columnDiff,
            columnDiffMode,
            columnDiffThreshold,
            customClassNames,
            customEvents,
            onRenderCode
        } = this.props;

        const diff = (() => {
            if (!columnDiff || !prev || !next) {
                return null;
            }

            if (columnDiffMode !== Infinity && leven(prev.content, next.content) > columnDiffThreshold) {
                return null;
            }

            const diffFunction = columnDiffMode === 'word' ? diffWordsWithSpace : diffChars;
            return diffFunction(prev.content.substring(1), next.content.substring(1));
        })();

        const commons = {diff, customClassNames, customEvents, onRenderCode};
        const prevArgs = {
            ...commons,
            change: prev,
            changePositionType: 0,
            selected: prevSelected,
            bindGutterEvents: this.bindPrevGutterEvents,
            bindCodeEvents: this.bindPrevCodeEvents
        };
        const nextArgs = {
            ...commons,
            change: next,
            changePositionType: 1,
            selected: nextSelected,
            bindGutterEvents: this.bindNextGutterEvents,
            bindCodeEvents: this.bindNextCodeEvents
        };

        return (
            <tr
                className={classNames('diff-line', customClassNames.line)}
                ref={container => this.container = container}
            >
                {renderCells(prevArgs)}
                {renderCells(nextArgs)}
            </tr>
        );
    }
}
