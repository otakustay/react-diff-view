import {memo} from 'react';
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
    text: PropTypes.string.isRequired,
    tokens: PropTypes.arrayOf(PropTypes.object),
};

CodeCell.defaultProps = {
    tokens: null,
};

export default memo(CodeCell);
