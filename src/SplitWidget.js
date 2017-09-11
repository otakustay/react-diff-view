import './Widget.css';

const SplitWidget = ({prevElement, nextElement, monotonous}) => {
    if (monotonous) {
        return (
            <tr className="widget">
                <td colSpan={2}>
                    {prevElement || nextElement}
                </td>
            </tr>
        );
    }

    if (prevElement === nextElement) {
        return (
            <tr className="widget">
                <td colSpan={4}>
                    {prevElement}
                </td>
            </tr>
        );
    }

    return (
        <tr className="widget">
            <td colSpan={2}>
                {prevElement}
            </td>
            <td colSpan={2}>
                {nextElement}
            </td>
        </tr>
    );
};

export default SplitWidget;
