import {memo} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const defaultRenderToken = ({type, value, markType, properties, className, children}, i) => {
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
        default: {
            // properties normally not exist since it is deconstructed in pickRange, remove in next major release
            const legacyClassName = properties && properties.className;
            return renderWithClassName(classNames(className || legacyClassName));
        }
    }
};

const CodeCell = props => {
    const {text, tokens, renderToken, ...attributes} = props;
    const actualRenderToken = renderToken
        ? (token, i) => renderToken(token, defaultRenderToken, i)
        : defaultRenderToken;

    return (
        <td {...attributes}>
            {
                tokens
                    ? (tokens.length ? tokens.map(actualRenderToken) : ' ')
                    : (text || ' ')
            }
        </td>
    );
};

CodeCell.propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
    tokens: PropTypes.arrayOf(PropTypes.object),
};

CodeCell.defaultProps = {
    tokens: null,
};

export default memo(CodeCell);
