import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';
import './Chunk.css';

const SplitChunk = ({changes, widgets, content, ...props}) => {
    const elements = [];
    const findWidget = targetChange => widgets.find(({change}) => change === targetChange);
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

    const renderRow = ([type, prev, next], i) => {
        if (type === 'change') {
            return <SplitChange key={i} prev={prev} next={next} {...props} />;
        }
        else if (type === 'widget') {
            const prevElement = prev ? prev.element : null;
            const nextElement = next ? next.element : null;
            return <SplitWidget key={i} prevElement={prevElement} nextElement={nextElement} />;
        }

        return null;
    };

    return (
        <tbody>
            <tr className="chunk">
                <td className="expand-more" />
                <td colSpan={3} className="chunk-summary">{content}</td>
            </tr>
            {elements.map(renderRow)}
        </tbody>
    );
};

SplitChunk.defaultProps = {
    widgets: []
};

export default SplitChunk;
