import UnifiedChange from './UnifiedChange';
import UnifiedWidget from './UnifiedWidget';

const groupElements = (changes, widgets) => changes.reduce(
    (elements, change) => {
        elements.push(['change', change]);

        const widget = widgets.find(widget => widget.change === change);

        if (widget) {
            elements.push(['widget', widget]);
        }

        return elements;
    },
    []
);

const renderRow = ([type, value], i, selectedChanges, props) => {
    if (type === 'change') {
        return <UnifiedChange key={i} change={value} selected={selectedChanges.includes(value)} {...props} />;
    }
    else if (type === 'widget') {
        return <UnifiedWidget key={i} element={value.element} />;
    }

    return null;
};

const ChunkHeader = ({elements}) => {
    if (!elements) {
        return null;
    }

    if (Array.isArray(elements)) {
        const [gutter, content] = elements;

        return (
            <tr className="chunk-header">
                <td colSpan={2} className="chunk-header-gutter">{gutter}</td>
                <td className="chunk-header-content">{content}</td>
            </tr>
        );
    }

    return (
        <tr className="chunk-header">
            <td colSpan={3} className="chunk-header-content">{elements}</td>
        </tr>
    );
};

const UnifiedChunk = ({chunk, widgets, selectedChanges, renderChunkHeader, ...props}) => {
    const elements = groupElements(chunk.changes, widgets);

    return (
        <tbody>
            <ChunkHeader elements={renderChunkHeader(chunk)} />
            {elements.map((element, i) => renderRow(element, i, selectedChanges, props))}
        </tbody>
    );
};

UnifiedChunk.defaultProps = {
    widgets: [],
    renderChunkHeader() {
        return null;
    }
};

export default UnifiedChunk;
