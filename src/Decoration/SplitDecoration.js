import {Children} from 'react';
import classNames from 'classnames';

const SplitDecoration = ({hideGutter, monotonous, className, gutterClassName, contentClassName, children}) => {
    const computedClassName = classNames('diff-decoration', className);
    const computedGutterClassName = classNames('diff-decoration-gutter', gutterClassName);
    const computedContentClassName = classNames('diff-decoration-content', contentClassName);
    const columnCount = (hideGutter ? 2 : 4) / (monotonous ? 2 : 1);
    const headerContentColSpan = columnCount - (hideGutter ? 0 : 1);

    // One element spans all gutter and content cells
    if (Children.count(children) === 1) {
        return (
            <tbody className={computedClassName}>
                <tr>
                    <td colSpan={columnCount} className={computedContentClassName}>
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
                {!hideGutter && <td className={computedGutterClassName}>{gutter}</td>}
                <td colSpan={headerContentColSpan} className={computedContentClassName}>{content}</td>
            </tr>
        </tbody>
    );
};

export default SplitDecoration;
