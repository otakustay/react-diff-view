import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';

const groupElements = (changes, widgets) => {
    const elements = [];
    const findWidget = targetChange => widgets.find(({change}) => change === targetChange);

    // TODO: 重构为reduce
    for (let i = 0; i < changes.length; i++) {
        const current = changes[i];

        if (current.normal) {
            elements.push(['change', current, current]);
        }
        else if (current.del) {
            const next = changes[i + 1];
            if (next && next.add) {
                i = i + 1;
                elements.push(['change', current, next]);
            }
            else {
                elements.push(['change', current, null]);
            }
        }
        else {
            elements.push(['change', null, current]);
        }

        const rowChanges = elements[elements.length - 1];
        const rowWidgets = rowChanges.slice(1).map(findWidget);
        if (rowWidgets[0] || rowWidgets[1]) {
            elements.push(['widget', ...rowWidgets]);
        }
    }

    return elements;
};

const renderRow = ([type, prev, next], i, selectedChanges, props) => {
    if (type === 'change') {
        return (
            <SplitChange
                key={i}
                prev={prev}
                next={next}
                prevSelected={selectedChanges.includes(prev)}
                nextSelected={selectedChanges.includes(next)}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        const prevElement = prev ? prev.element : null;
        const nextElement = next ? next.element : null;
        return <SplitWidget key={i} prevElement={prevElement} nextElement={nextElement} />;
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
                <td className="chunk-header-gutter">{gutter}</td>
                <td colSpan={3} className="chunk-header-content">{content}</td>
            </tr>
        );
    }

    return (
        <tr className="chunk-header">
            <td colSpan={4} className="chunk-header-content">{elements}</td>
        </tr>
    );
};

const SplitChunk = ({chunk, widgets, selectedChanges, renderChunkHeader, ...props}) => {
    const elements = groupElements(chunk.changes, widgets);

    return (
        <tbody>
            <ChunkHeader elements={renderChunkHeader(chunk)} />
            {elements.map((element, i) => renderRow(element, i, selectedChanges, props))}
        </tbody>
    );
};

SplitChunk.defaultProps = {
    widgets: [],
    renderChunkHeader() {
        return null;
    }
};

export default SplitChunk;
