import warning from 'warning';
import mapValues from 'lodash.mapvalues';
import classNames from 'classnames';
import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';
import {getChangeKey} from './utils';

const keyForPair = (x, y) => {
    const keyForX = x ? getChangeKey(x) : '00';
    const keyForY = y ? getChangeKey(y) : '00';
    return keyForX + keyForY;
};

const groupElements = (changes, widgets) => {
    const findWidget = change => {
        if (!change) {
            return null;
        }

        const key = getChangeKey(change);
        return widgets[key] || null;
    };
    const elements = [];

    // This could be a very complex reduce call, use `for` loop seems to make it a little more readable
    for (let i = 0; i < changes.length; i++) {
        const current = changes[i];

        // A normal change is displayed on both side
        if (current.isNormal) {
            elements.push(['change', keyForPair(current, current), current, current]);
        }
        else if (current.isDelete) {
            const next = changes[i + 1];
            // If an insert change is following a elete change, they should be displayed side by side
            if (next && next.isInsert) {
                i = i + 1;
                elements.push(['change', keyForPair(current, next), current, next]);
            }
            else {
                elements.push(['change', keyForPair(current, null), current, null]);
            }
        }
        else {
            elements.push(['change', keyForPair(null, current), null, current]);
        }

        const rowChanges = elements[elements.length - 1];
        const [oldWidget, newWidget] = rowChanges.slice(2).map(findWidget);
        if (oldWidget || newWidget) {
            const key = rowChanges[1];
            elements.push(['widget', key, oldWidget, newWidget]);
        }
    }

    return elements;
};

const renderRow = ([type, key, oldValue, newValue], i, selectedChanges, monotonous, hideGutter, props) => {
    if (type === 'change') {
        const oldSelected = oldValue ? selectedChanges.includes(getChangeKey(oldValue)) : false;
        const newSelected = newValue ? selectedChanges.includes(getChangeKey(newValue)) : false;

        return (
            <SplitChange
                key={`change${key}`}
                oldChange={oldValue}
                newChange={newValue}
                monotonous={monotonous}
                hideGutter={hideGutter}
                oldSelected={oldSelected}
                newSelected={newSelected}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        return (
            <SplitWidget
                key={`widget${key}`}
                monotonous={monotonous}
                hideGutter={hideGutter}
                oldElement={oldValue}
                newElement={newValue}
            />
        );
    }

    return null;
};

const HunkHeader = props => {
    const {
        hideGutter,
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
    const columnCount = (hideGutter ? 2 : 4) / (monotonous ? 2 : 1);
    const headerContentColSpan = columnCount - (hideGutter ? 0 : 1);

    if (elements === undefined) {
        return (
            <tr className={computedClassName}>
                {!hideGutter && <td className={computedGutterClassName} {...boundGutterEvents} />}
                <td
                    colSpan={headerContentColSpan}
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
        warning(
            !hideGutter,
            'Gutter element in hunk header will not be rendered since hideGutter prop is set to true'
        );

        const [gutter, content] = elements;

        return (
            <tr className={computedClassName}>
                {!hideGutter && <td className={computedGutterClassName} {...boundGutterEvents}>{gutter}</td>}
                <td
                    colSpan={headerContentColSpan}
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
            <td
                colSpan={columnCount}
                className={computedContentClassName}
                {...boundContentEvents}
            >
                {elements}
            </td>
        </tr>
    );
};

const SplitHunk = props => {
    const {
        hunk,
        monotonous,
        hideGutter,
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
                hideGutter={hideGutter}
                elements={header}
                gutterEvents={headerGutterEvents}
                contentEvents={headerContentEvents}
                className={headerClassName}
                gutterClassName={headerGutterClassName}
                contentClassName={headerContentClassName}
            />
            {elements.map((item, i) => renderRow(item, i, selectedChanges, monotonous, hideGutter, childrenProps))}
        </tbody>
    );
};

export default SplitHunk;
