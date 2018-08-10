import {Children} from 'react';
import classNames from 'classnames';

const UnifiedDecoration = ({hideGutter, className, gutterClassName, contentClassName, children}) => {
    const computedClassName = classNames('diff-decoration', className);
    const computedGutterClassName = classNames('diff-decoration-gutter', gutterClassName);
    const computedContentClassName = classNames('diff-decoration-content', contentClassName);

    // One element spans all gutter and content cells
    if (Children.count(children) === 1) {
        return (
            <tbody className={computedClassName}>
                <tr>
                    <td colSpan={hideGutter ? 1 : 3} className={computedContentClassName}>
                        {children}
                    </td>
                </tr>
            </tbody>
        );
    }

    const [gutter, content] = children;

    return (
        <tbody className={computedClassName}>
            <tr>
                {!hideGutter && <td colSpan={2} className={computedGutterClassName}>{gutter}</td>}
                <td className={computedContentClassName}>{content}</td>
            </tr>
        </tbody>
    );
};

export default UnifiedDecoration;
