import './Widget.css';

const SplitWidget = ({oldElement, newElement, monotonous}) => {
    if (monotonous) {
        return (
            <tr className="widget">
                <td colSpan={2}>
                    {oldElement || newElement}
                </td>
            </tr>
        );
    }

    if (oldElement === newElement) {
        return (
            <tr className="widget">
                <td colSpan={4}>
                    {oldElement}
                </td>
            </tr>
        );
    }

    return (
        <tr className="widget">
            <td colSpan={2}>
                {oldElement}
            </td>
            <td colSpan={2}>
                {newElement}
            </td>
        </tr>
    );
};

export default SplitWidget;
