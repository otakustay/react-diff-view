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
        if (current.isNormal) {
            elements.push(['change', current, current]);
        }
        else if (current.isDelete) {
            const next = changes[i + 1];
            // If an insert change is following a elete change, they should be displayed side by side
            if (next && next.isInsert) {
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

const renderRow = ([type, oldChange, newChange], i, selectedChanges, monotonous, props) => {
    if (type === 'change') {
        return (
            <SplitChange
                key={i}
                oldChange={oldChange}
                newChange={newChange}
                monotonous={monotonous}
                oldSelected={selectedChanges.includes(oldChange)}
                newSelected={selectedChanges.includes(newChange)}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        const oldElement = oldChange ? oldChange.element : null;
        const newElement = newChange ? newChange.element : null;
        return <SplitWidget key={i} monotonous={monotonous} oldElement={oldElement} newElement={newElement} />;
    }

    return null;
};

const HunkHeader = props => {
    const {
        hunk,
        monotonous,
        elements,
        gutterEvents,
        contentEvents,
        className,
        gutterClassName,
        contentClassName
    } = props;
    const bindHunk = fn => () => fn(hunk);
    const boundGutterEvents = mapValues(gutterEvents, bindHunk);
    const boundContentEvents = mapValues(contentEvents, bindHunk);

    const computedClassName = classNames('diff-hunk-header', className);
    const computedGutterClassName = classNames('diff-hunk-header-gutter', gutterClassName);
    const computedContentClassName = classNames('diff-hunk-header-content', contentClassName);

    if (elements === undefined) {
        return (
            <tr className={computedClassName}>
                <td className={computedGutterClassName} {...boundGutterEvents}></td>
                <td
                    colSpan={monotonous ? 1 : 3}
                    className={computedContentClassName}
                    {...boundContentEvents}
                >
                    {hunk.content}
                </td>
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
                <td
                    colSpan={monotonous ? 1 : 3}
                    className={computedContentClassName}
                    {...boundContentEvents}
                >
                    {content}
                </td>
            </tr>
        );
    }

    return (
        <tr className={computedClassName}>
            <td colSpan={monotonous ? 2 : 4} className={computedContentClassName}>{elements}</td>
        </tr>
    );
};

const SplitHunk = props => {
    const {
        hunk,
        monotonous,
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
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            <HunkHeader
                hunk={hunk}
                monotonous={monotonous}
                elements={header}
                gutterEvents={headerGutterEvents}
                contentEvents={headerContentEvents}
                className={headerClassName}
                gutterClassName={headerGutterClassName}
                contentClassName={headerContentClassName}
            />
            {elements.map((element, i) => renderRow(element, i, selectedChanges, monotonous, childrenProps))}
        </tbody>
    );
};

export default SplitHunk;
