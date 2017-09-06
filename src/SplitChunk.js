import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';

const groupElements = (changes, widgets) => {
    const elements = [];
    const findWidget = targetChange => widgets.find(({change}) => change === targetChange);

    // This could be a very complex reduce call, use `for` loop seems to make it a little more readable
    for (let i = 0; i < changes.length; i++) {
        const current = changes[i];

        // A normal change is displayed on both side
        if (current.normal) {
            elements.push(['change', current, current]);
        }
        else if (current.del) {
            const next = changes[i + 1];
            // If an add change is following a del change, they should be displayed side by side
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
                <td className={computedGutterClassName} {...boundGutterEvents}></td>
                <td colSpan={3} className={computedContentClassName} {...boundContentEvents}>{chunk.content}</td>
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
                <td className={computedGutterClassName} {...boundGutterEvents}>{gutter}</td>
                <td colSpan={3} className={computedContentClassName} {...boundContentEvents}>{content}</td>
            </tr>
        );
    }

    return (
        <tr className={computedClassName}>
            <td colSpan={4} className={computedContentClassName}>{elements}</td>
        </tr>
    );
};

const SplitChunk = props => {
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

export default SplitChunk;
