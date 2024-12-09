import {HTMLAttributes, memo} from 'react';
import classNames from 'classnames';
import {TokenNode} from '../tokenize';
import {DefaultRenderToken, RenderToken} from '../context';

const defaultRenderToken: DefaultRenderToken = ({type, value, markType, properties, className, children}, i) => {
    const renderWithClassName = (className: string) => (
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

function isEmptyToken(tokens: TokenNode[]) {
    if (!Array.isArray(tokens)) {
        return true;
    }

    if (tokens.length > 1) {
        return false;
    }

    if (tokens.length === 1) {
        const [token] = tokens;
        return token.type === 'text' && !token.value;
    }

    return true;
}

export interface CodeCellProps extends HTMLAttributes<HTMLTableCellElement> {
    changeKey: string;
    text: string;
    tokens: TokenNode[] | null;
    renderToken: RenderToken | undefined;
}

function CodeCell(props: CodeCellProps) {
    const {changeKey, text, tokens, renderToken, ...attributes} = props;
    const actualRenderToken: DefaultRenderToken = renderToken
        ? (token, i) => renderToken(token, defaultRenderToken, i)
        : defaultRenderToken;

    return (
        <td {...attributes} data-change-key={changeKey}>
            {
                tokens
                    ? (isEmptyToken(tokens) ? ' ' : tokens.map(actualRenderToken))
                    : (text || ' ')
            }
        </td>
    );
}

export default memo(CodeCell);
