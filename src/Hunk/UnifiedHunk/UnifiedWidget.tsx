// @ts-nocheck ignore: third-party
function UnifiedWidget({hideGutter, element}) {
    return (
        <tr className="diff-widget">
            <td colSpan={hideGutter ? 1 : 3} className="diff-widget-content">
                {element}
            </td>
        </tr>
    );
}

export default UnifiedWidget;
