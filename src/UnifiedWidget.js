import './Widget.css';

const UnifiedWidget = ({element}) => (
    <tr className="widget">
        <td colSpan={3}>
            {element}
        </td>
    </tr>
);

export default UnifiedWidget;
