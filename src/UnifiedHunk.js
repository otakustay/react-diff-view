import {PureComponent} from 'react';
import classNames from 'classnames';
import UnifiedChange from './UnifiedChange';
import UnifiedWidget from './UnifiedWidget';
import {createEventsBindingSelector} from './selectors';
import {getChangeKey} from './utils';

const groupElements = (changes, widgets) => changes.reduce(
    (elements, change) => {
        const key = getChangeKey(change);

        elements.push(['change', key, change]);

        const widget = widgets[key];

        if (widget) {
            elements.push(['widget', key, widget]);
        }

        return elements;
    },
    []
);

const renderRow = ([type, key, value], i, selectedChanges, props) => {
    const {hideGutter} = props;

    if (type === 'change') {
        return (
            <UnifiedChange
                key={`change${key}`}
                change={value}
                selected={selectedChanges.includes(key)}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        return <UnifiedWidget key={`widget${key}`} hideGutter={hideGutter} element={value} />;
    }

    return null;
};

class HunkHeader extends PureComponent {

    bindGutterEvents = createEventsBindingSelector();

    bindContentEvents = createEventsBindingSelector();

    render() {
        const {
            hideGutter,
            hunk,
            elements,
            gutterEvents,
            contentEvents,
            className,
            gutterClassName,
            contentClassName
        } = this.props;
        const boundGutterEvents = this.bindGutterEvents(gutterEvents, hunk);
        const boundContentEvents = this.bindGutterEvents(contentEvents, hunk);

        const computedClassName = classNames('diff-hunk-header', className);
        const gutterProps = {
            colSpan: 2,
            className: classNames('diff-hunk-header-gutter', gutterClassName),
            ...boundGutterEvents
        };
        const contentProps = {
            className: classNames('diff-hunk-header-content', contentClassName),
            ...boundContentEvents
        };

        if (elements === undefined) {
            return (
                <tr className={computedClassName}>
                    {!hideGutter && <td {...gutterProps} />}
                    <td {...contentProps}>{hunk.content}</td>
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
                    {!hideGutter && <td {...gutterProps}>{gutter}</td>}
                    <td {...contentProps}>{content}</td>
                </tr>
            );
        }

        return (
            <tr className={computedClassName}>
                <td {...contentProps} colSpan={hideGutter ? 1 : 3}>{elements}</td>
            </tr>
        );
    }
}

const UnifiedHunk = props => {
    const {
        hunk,
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
    const {hideGutter} = childrenProps;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            <HunkHeader
                hideGutter={hideGutter}
                hunk={hunk}
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

export default UnifiedHunk;
