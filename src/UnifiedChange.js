import {PureComponent} from 'react';
import classNames from 'classnames';
import './Change.css';

export default class UnifiedChange extends PureComponent {

    static defaultProps = {
        onSelect() {
        },
        onRenderCode() {
        }
    };

    componentDidMount() {
        const {change, onRenderCode} = this.props;
        const cell = this.container.querySelector('.code');
        onRenderCode(cell, change);
    }

    componentDidUpdate() {
        // TODO: 如何判断一个td里的代码是不是已经高亮过了？
    }

    selectCode = () => {
        const {change, selected, onSelect} = this.props;
        onSelect(change, !selected);
    };

    render() {
        const {change, selected, customClassNames, customEvents} = this.props;
        const {type, normal, add, del, ln, ln1, ln2, content} = change;
        const prevLine = normal ? ln1 : ln;
        const nextLine = normal ? ln2 : ln;
        const events = Object.keys(customEvents.code).reduce(
            (events, key) => {
                const handler = customEvents.code[key];
                events[key] = () => handler(change);
                return events;
            },
            {}
        );

        const gutterClassName = classNames('gutter', type, {selected});
        const codeClassName = classNames('code', type, customClassNames.code, {selected});

        return (
            <tr className={classNames('line', type)} ref={container => this.container = container}>
                <td className={gutterClassName} onClick={this.selectCode}>{!add && prevLine}</td>
                <td className={gutterClassName} onClick={this.selectCode}>{!del && nextLine}</td>
                <td className={codeClassName} {...events}>{content.substring(1)}</td>
            </tr>
        );
    }
}
