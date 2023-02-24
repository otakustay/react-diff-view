import {ReactNode} from 'react';

export interface UnifiedWidgetProps {
    hideGutter: boolean;
    element: ReactNode;
}

export default function UnifiedWidget({hideGutter, element}: UnifiedWidgetProps) {
    return (
        <tr className="diff-widget">
            <td colSpan={hideGutter ? 1 : 3} className="diff-widget-content">
                {element}
            </td>
        </tr>
    );
}
