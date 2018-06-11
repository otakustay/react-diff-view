/* eslint-disable no-empty-function */
import {PureComponent} from 'react';

export default class CodeCell extends PureComponent {

    static defaultProps = {
        onRender() {
        }
    };

    cell = null;

    componentDidMount() {
        this.notifyRender();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.text !== this.props.text || prevProps.html !== this.props.html) {
            this.notifyRender();
        }
    }

    notifyRender() {
        this.props.onRender(this.cell);
    }

    render() {
        /* eslint-disable no-unused-vars */
        const {text, html, onRender, ...props} = this.props;
        /* eslint-enable no-unused-vars */

        const ref = cell => (this.cell = cell);

        if (html) {
            /* eslint-disable react/no-danger */
            return (
                <td {...props}>
                    <span
                        ref={ref}
                        className="diff-code-text"
                        dangerouslySetInnerHTML={{__html: html}}
                    />
                </td>
            );
            /* eslint-enable react/no-danger */
        }

        return (
            <td {...props}>
                <span ref={ref} className="diff-code-text">{text}</span>
            </td>
        );
    }
}
