import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const renderToken = ({type, value, markType, properties, children}, i) => {
    const renderWithClassName = className => (
        <span key={i} className={className}>
            {value ? value : (children && children.map(renderToken))}
        </span>
    );

    switch (type) {
        case 'text':
            return value;
        case 'mark':
            return renderWithClassName(`diff-code-mark diff-code-mark-${markType}`);
        case 'edit':
            return renderWithClassName('diff-code-edit');
        default:
            return renderWithClassName(classNames(properties.className));
    }
};

// `CodeCell` is very performance sensitive, use `PureComponent` here
export default class CodeCell extends PureComponent { // eslint-disable-line react/prefer-stateless-function

    static propTypes = {
        text: PropTypes.string.isRequired,
        tokens: PropTypes.arrayOf(PropTypes.object)
    };

    static defaultProps = {
        tokens: null
    };

    render() {
        const {text, tokens, className, ...props} = this.props;

        return (
            <td className={className} {...props}>
                {
                    tokens
                        ? (tokens.length ? tokens.map(renderToken) : ' ')
                        : (text || ' ')
                }
            </td>
        );
    }
}
