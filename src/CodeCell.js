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
            return <td ref={ref} {...props} dangerouslySetInnerHTML={{__html: html}} />;
            /* eslint-enable react/no-danger */
        }

        return <td ref={ref} {...props}>{text}</td>;
    }
}
