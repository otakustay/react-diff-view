import './Widget.css';

const SplitWidget = ({oldElement, newElement, monotonous}) => {
    if (monotonous) {
        return (
            <tr className="diff-widget">
                <td colSpan={2} className="diff-widget-content">
                    {oldElement || newElement}
                </td>
            </tr>
        );
    }

    if (oldElement === newElement) {
        return (
            <tr className="diff-widget">
                <td colSpan={4} className="diff-widget-content">
                    {oldElement}
                </td>
            </tr>
        );
    }

    return (
        <tr className="diff-widget">
            <td colSpan={2} className="diff-widget-content">
                {oldElement}
            </td>
            <td colSpan={2} className="diff-widget-content">
                {newElement}
            </td>
        </tr>
    );
};

export default SplitWidget;
