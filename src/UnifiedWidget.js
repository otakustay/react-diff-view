import './Widget.css';

const UnifiedWidget = ({element}) => (
    <tr className="diff-widget">
        <td colSpan={3} className="diff-widget-content">
            {element}
        </td>
    </tr>
);

export default UnifiedWidget;
