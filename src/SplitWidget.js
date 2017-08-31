import './Widget.css';

const SplitWidget = ({prevElement, nextElement}) => {
    if (prevElement === nextElement) {
        return (
            <tr className="widget">
                <td className="widget-normal" colSpan={4}>
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
