import {HTMLAttributes, memo} from 'react';
import classNames from 'classnames';
import {TokenNode} from 'react-diff-view/tokenize';
import {DefaultRenderToken, RenderToken} from './interface';

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

export interface CodeCellProps extends HTMLAttributes<HTMLTableCellElement> {
    text: string;
    tokens: TokenNode[] | null;
    renderToken: RenderToken;
}

function CodeCell(props: CodeCellProps) {
    const {text, tokens, renderToken, ...attributes} = props;
    const actualRenderToken: DefaultRenderToken = renderToken
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
}

export default memo(CodeCell);
