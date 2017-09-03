import mapValues from 'lodash.mapvalues';
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

const ChunkHeader = ({chunk, elements, gutterEvents, contentEvents}) => {
    const bindChunk = fn => () => fn(chunk);
    const boundGutterEvents = mapValues(gutterEvents, bindChunk);
    const boundContentEvents = mapValues(contentEvents, bindChunk);

    if (elements === undefined) {
        return (
            <tr className="chunk-header">
                <td colSpan={2} className="chunk-header-gutter" {...boundGutterEvents}></td>
                <td className="chunk-header-content" {...boundContentEvents}>{chunk.content}</td>
            </tr>
        );
    }

    if (elements === null) {
        return null;
    }

    if (Array.isArray(elements)) {
        const [gutter, content] = elements;

        return (
            <tr className="chunk-header">
                <td colSpan={2} className="chunk-header-gutter" {...boundGutterEvents}>{gutter}</td>
                <td className="chunk-header-content" {...boundContentEvents}>{content}</td>
            </tr>
        );
    }

    return (
        <tr className="chunk-header">
            <td colSpan={3} className="chunk-header-content" {...boundContentEvents}>{elements}</td>
        </tr>
    );
};

const UnifiedChunk = ({chunk, widgets, selectedChanges, header, headerGutterEvents, headerContentEvents, ...props}) => {
    const elements = groupElements(chunk.changes, widgets);

    return (
        <tbody>
            <ChunkHeader
                chunk={chunk}
                elements={header}
                gutterEvents={headerGutterEvents}
                contentEvents={headerContentEvents}
            />
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
