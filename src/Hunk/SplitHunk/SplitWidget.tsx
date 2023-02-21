import {ReactElement} from 'react';

export interface SplitWidgetProps {
    hideGutter: boolean;
    oldElement: ReactElement | null;
    newElement: ReactElement | null;
    monotonous: boolean;
}

export default function SplitWidget({hideGutter, oldElement, newElement, monotonous}: SplitWidgetProps) {
    if (monotonous) {
        return (
            <tr className="diff-widget">
                <td colSpan={hideGutter ? 1 : 2} className="diff-widget-content">
                    {oldElement || newElement}
                </td>
            </tr>
        );
    }

    if (oldElement === newElement) {
        return (
            <tr className="diff-widget">
                <td colSpan={hideGutter ? 2 : 4} className="diff-widget-content">
                    {oldElement}
                </td>
            </tr>
        );
    }

    return (
        <tr className="diff-widget">
            <td colSpan={hideGutter ? 1 : 2} className="diff-widget-content">
                {oldElement}
            </td>
            <td colSpan={hideGutter ? 1 : 2} className="diff-widget-content">
                {newElement}
            </td>
        </tr>
    );
}
