import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
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

const ChunkHeader = props => {
    const {
        chunk,
        elements,
        gutterEvents,
        contentEvents,
        className,
        gutterClassName,
        contentClassName
    } = props;
    const bindChunk = fn => () => fn(chunk);
    const boundGutterEvents = mapValues(gutterEvents, bindChunk);
    const boundContentEvents = mapValues(contentEvents, bindChunk);

    const computedClassName = classNames('diff-chunk-header', className);
    const computedGutterClassName = classNames('diff-chunk-header-gutter', gutterClassName);
    const computedContentClassName = classNames('diff-chunk-header-content', contentClassName);

    if (elements === undefined) {
        return (
            <tr className={computedClassName}>
                <td colSpan={2} className={computedGutterClassName} {...boundGutterEvents}></td>
                <td className={computedContentClassName} {...boundContentEvents}>{chunk.content}</td>
            </tr>
        );
    }

    if (elements === null) {
        return null;
    }

    if (Array.isArray(elements)) {
        const [gutter, content] = elements;

        return (
            <tr className={computedClassName}>
                <td colSpan={2} className={computedGutterClassName} {...boundGutterEvents}>{gutter}</td>
                <td className={computedContentClassName} {...boundContentEvents}>{content}</td>
            </tr>
        );
    }

    return (
        <tr className={computedClassName}>
            <td colSpan={3} className={computedContentClassName} {...boundContentEvents}>{elements}</td>
        </tr>
    );
};

const UnifiedChunk = props => {
    const {
        chunk,
        widgets,
        selectedChanges,
        header,
        headerGutterEvents,
        headerContentEvents,
        className,
        headerClassName,
        headerGutterClassName,
        headerContentClassName,
        ...childrenProps
    } = props;
    const elements = groupElements(chunk.changes, widgets);

    return (
        <tbody className={classNames('diff-chunk', className)}>
            <ChunkHeader
                chunk={chunk}
                elements={header}
                gutterEvents={headerGutterEvents}
                contentEvents={headerContentEvents}
                className={headerClassName}
                gutterClassName={headerGutterClassName}
                contentClassName={headerContentClassName}
            />
            {elements.map((element, i) => renderRow(element, i, selectedChanges, childrenProps))}
        </tbody>
    );
};

export default UnifiedChunk;
