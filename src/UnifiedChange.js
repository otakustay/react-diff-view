import {PureComponent} from 'react';
import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
import './Change.css';

export default class UnifiedChange extends PureComponent {

    static defaultProps = {
        customEvents: {},
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

    render() {
        const {change, selected, customClassNames, customEvents} = this.props;
        const {type, normal, add, del, ln, ln1, ln2, content} = change;
        const prevLine = normal ? ln1 : ln;
        const nextLine = normal ? ln2 : ln;

        const bindChange = fn => () => fn(change);
        const boundGutterEvents = mapValues(customEvents.gutter, bindChange);
        const boundCodeEvents = mapValues(customEvents.code, bindChange);

        const gutterClassName = classNames('gutter', type, {selected});
        const codeClassName = classNames('code', type, customClassNames.code, {selected});

        return (
            <tr className={classNames('line', type)} ref={container => this.container = container}>
                <td className={gutterClassName} {...boundGutterEvents}>{!add && prevLine}</td>
                <td className={gutterClassName} {...boundGutterEvents}>{!del && nextLine}</td>
                <td className={codeClassName} {...boundCodeEvents}>{content.substring(1)}</td>
            </tr>
        );
    }
}
