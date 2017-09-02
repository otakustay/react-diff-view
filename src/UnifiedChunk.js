import UnifiedChange from './UnifiedChange';
import UnifiedWidget from './UnifiedWidget';
import './Chunk.css';

const UnifiedChunk = ({changes, widgets, content, selectedChanges, ...props}) => {
    const findWidget = targetChange => widgets.find(({change}) => change === targetChange);
    const elements = changes.reduce(
        (elements, change) => {
            elements.push(['change', change]);

            const widget = findWidget(change);
            if (widget) {
                elements.push(['widget', widget]);
            }

            return elements;
        },
        []
    );

    const renderRow = ([type, value], i) => {
        if (type === 'change') {
            return <UnifiedChange key={i} change={value} selected={selectedChanges.includes(value)} {...props} />;
        }
        else if (type === 'widget') {
            return <UnifiedWidget key={i} element={value.element} />;
        }

        return null;
    };

    return (
        <tbody>
            <tr className="chunk">
                <td colSpan={2} className="expand-more" />
                <td className="chunk-summary">{content}</td>
            </tr>
            {elements.map(renderRow)}
        </tbody>
    );
};

UnifiedChunk.defaultProps = {
    widgets: []
};

export default UnifiedChunk;
