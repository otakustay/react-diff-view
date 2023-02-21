import {Children, ReactNode} from 'react';
import classNames from 'classnames';
import {ActualDecorationProps} from './interface';

export default function SplitDecoration(props: ActualDecorationProps) {
    const {hideGutter, monotonous, className, gutterClassName, contentClassName, children} = props;
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

    const [gutter, content] = children as [ReactNode, ReactNode];

    return (
        <tbody className={computedClassName}>
            <tr>
                {!hideGutter && <td className={computedGutterClassName}>{gutter}</td>}
                <td colSpan={headerContentColSpan} className={computedContentClassName}>{content}</td>
            </tr>
        </tbody>
    );
}
