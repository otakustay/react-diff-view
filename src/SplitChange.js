import {PureComponent} from 'react';
import classNames from 'classnames';
import diffString from 'fast-diff';
import leven from 'leven';
import escape from 'lodash.escape';
import './Change.css';

const renderCells = (change, base, diff, n, selected, customClassNames, customEvents, onSelect) => {
    if (!change) {
        return [
            <td key="gutter" className={classNames('gutter', 'omit', customClassNames.gutter)} />,
            <td key="code" className={classNames('code', 'omit', customClassNames.code)} />
        ];
    }

    const {type, normal, add, del, ln, ln1, ln2, content} = change;
    const line = normal ? (n === 1 ? ln1 : ln2) : ln;
    const shouldRender = n === 1 ? !add : !del;
    const gutterClassName = classNames('gutter', type, customClassNames.gutter, {selected});
    const codeClassName = classNames('code', type, customClassNames.code, {selected});

    if (!shouldRender) {
        return [
            <td key="gutter" className={gutterClassName} />,
            <td key="code" className={codeClassName} />
        ];
    }

    const events = Object.keys(customEvents.code).reduce(
        (events, key) => {
            const handler = customEvents.code[key];
            events[key] = () => handler(change);
            return events;
        },
        {}
    );

    if (!diff || diff.length <= 1) {
        return [
            <td key="gutter" className={gutterClassName} onClick={onSelect}>{line}</td>,
            <td key="code" className={codeClassName} {...events}>{content.substring(1)}</td>
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
        <td key="gutter" className={gutterClassName} onClick={onSelect}>{line}</td>,
        <td
            key="code"
            className={codeClassName}
            {...events}
            dangerouslySetInnerHTML={{__html: html}}
        />
    ];
};

export default class SplitChange extends PureComponent {

    static defaultProps = {
        columnDiff: true,
        columnDiffThreshold: 15,
        customEvents: {},
        prevSelected: false,
        nextSelected: false,
        highlight(code) {
            return code;
        },
        onSelect() {
        }
    };

    componentDidMount() {
        const {highlight} = this.props;

        if (!highlight) {
            return;
        }

        const cells = this.container.querySelectorAll('.code');
        for (const cell of cells) {
            highlight(cell);
        }
    }

    componentDidUpdate() {
        // TODO: 如何判断一个td里的代码是不是已经高亮过了？
    }

    selectPrevCode = () => {
        const {onSelect, prev, prevSelected} = this.props;
        onSelect(prev, !prevSelected);
    };

    selectNextCode = () => {
        const {onSelect, next, nextSelected} = this.props;
        onSelect(next, !nextSelected);
    };

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
                {renderCells(prev, next, diff, 1, prevSelected, customClassNames, customEvents, this.selectPrevCode)}
                {renderCells(next, prev, diff, 2, nextSelected, customClassNames, customEvents, this.selectNextCode)}
            </tr>
        );
    }
}
