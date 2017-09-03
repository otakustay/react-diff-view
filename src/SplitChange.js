import {PureComponent} from 'react';
import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
import diffString from 'fast-diff';
import leven from 'leven';
import escape from 'lodash.escape';
import './Change.css';

const renderCells = (change, base, diff, n, selected, customClassNames, customEvents) => {
    const bindChange = fn => () => fn(change);
    const boundGutterEvents = mapValues(customEvents.gutter, bindChange);
    const boundCodeEvents = mapValues(customEvents.code, bindChange);

    if (!change) {
        return [
            <td key="gutter" className={classNames('gutter', 'omit', customClassNames.gutter)} />,
            <td key="code" className={classNames('code', 'omit', customClassNames.code)} />
        ];
    }

    const {type, normal, ln, ln1, ln2, content} = change;
    const line = normal ? (n === 1 ? ln1 : ln2) : ln;
    const gutterClassName = classNames('gutter', type, customClassNames.gutter, {selected});
    const codeClassName = classNames('code', type, customClassNames.code, {selected});

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

            return html += `<span class="diff-text">${escape(value)}</span>`;
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

    static defaultProps = {
        columnDiff: true,
        columnDiffThreshold: 15,
        customEvents: {},
        onRenderCode() {
        }
    };

    componentDidMount() {
        const {prev, next, onRenderCode} = this.props;
        const [prevCell, nextCell] = this.container.querySelectorAll('.code');
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
            <tr className="line" ref={container => this.container = container}>
                {renderCells(prev, next, diff, 1, prevSelected, customClassNames, customEvents)}
                {renderCells(next, prev, diff, 2, nextSelected, customClassNames, customEvents)}
            </tr>
        );
    }
}
