import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
import diffString from 'fast-diff';
import leven from 'leven';
import escape from 'lodash.escape';
import {computePrevLineNumber, computeNextLineNumber} from './utils';
import {changePropType, eventsPropType, classNamesPropType} from './propTypes';
import './Change.css';

const renderCells = (change, base, diff, n, selected, customClassNames, customEvents) => {
    const bindChange = fn => () => fn(change);
    const boundGutterEvents = mapValues(customEvents.gutter, bindChange);
    const boundCodeEvents = mapValues(customEvents.code, bindChange);

    if (!change) {
        return [
            <td key="gutter" className={classNames('diff-gutter', 'diff-gutter-omit', customClassNames.gutter)} />,
            <td key="code" className={classNames('diff-code', 'diff-code-omit', customClassNames.code)} />
        ];
    }

    const {type, content} = change;
    const line = n === 1 ? computePrevLineNumber(change) : computeNextLineNumber(change);
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

    if (!diff || diff.length <= 1) {
        return [
            <td key="gutter" className={gutterClassName} {...boundGutterEvents}>{line}</td>,
            <td key="code" className={codeClassName} {...boundCodeEvents}>{content.substring(1)}</td>
        ];
    }

    const discardingDiffType = n === 1 ? 1 : -1;
    const usefulDiff = diff.filter(([type]) => type !== discardingDiffType);
    const html = usefulDiff.reduce(
        (html, [type, value]) => {
            if (type === 0) {
                return html += escape(value);
            }

            return html += `<span class="diff-column-text">${escape(value)}</span>`;
        },
        ''
    );

    return [
        <td key="gutter" className={gutterClassName} {...boundGutterEvents}>{line}</td>,
        <td
            key="code"
            className={codeClassName}
            {...boundCodeEvents}
            dangerouslySetInnerHTML={{__html: html}}
        />
    ];
};

export default class SplitChange extends PureComponent {

    static propTypes = {
        prev: changePropType,
        next: changePropType,
        prevSelected: PropTypes.bool.isRequired,
        nextSelected: PropTypes.bool.isRequired,
        columnDiff: PropTypes.bool,
        columnDiffThreshold: PropTypes.number,
        customEvents: eventsPropType,
        customClassNames: classNamesPropType,
        onRenderCode: PropTypes.func
    };

    static defaultProps = {
        columnDiff: true,
        columnDiffThreshold: 15,
        customEvents: {},
        onRenderCode() {
        }
    };

    componentDidMount() {
        const {prev, next, onRenderCode} = this.props;
        const [prevCell, nextCell] = this.container.querySelectorAll('.diff-code');
        onRenderCode(prevCell, prev);
        onRenderCode(nextCell, next);
    }

    componentDidUpdate() {
        // TODO: 如何判断一个td里的代码是不是已经高亮过了？
    }

    render() {
        const {
            prev,
            next,
            prevSelected,
            nextSelected,
            columnDiff,
            columnDiffThreshold,
            customClassNames,
            customEvents
        } = this.props;
        const diff = (columnDiff && prev && next && leven(prev.content, next.content) <= columnDiffThreshold)
            ? diffString(prev.content.substring(1), next.content.substring(1))
            : null;

        return (
            <tr
                className={classNames('diff-line', customClassNames.line)}
                ref={container => this.container = container}
            >
                {renderCells(prev, next, diff, 1, prevSelected, customClassNames, customEvents)}
                {renderCells(next, prev, diff, 2, nextSelected, customClassNames, customEvents)}
            </tr>
        );
    }
}
