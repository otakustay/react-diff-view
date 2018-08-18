import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const defaultRenderToken = ({type, value, markType, properties, children}, i) => {
    const renderWithClassName = className => (
        <span key={i} className={className}>
            {value ? value : (children && children.map(defaultRenderToken))}
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
        const {text, tokens, className, renderToken, ...props} = this.props;
        const actualRenderToken = renderToken
            ? (token, i) => renderToken(token, defaultRenderToken, i)
            : defaultRenderToken;

        return (
            <td className={className} {...props}>
                {
                    tokens
                        ? (tokens.length ? tokens.map(actualRenderToken) : ' ')
                        : (text || ' ')
                }
            </td>
        );
    }
}
