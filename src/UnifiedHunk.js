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
        return <UnifiedWidget key={`widget${key}`} element={value} />;
    }

    return null;
};

class HunkHeader extends PureComponent {

    bindGutterEvents = createEventsBindingSelector();

    bindContentEvents = createEventsBindingSelector();

    render() {
        const {
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
        const computedGutterClassName = classNames('diff-hunk-header-gutter', gutterClassName);
        const computedContentClassName = classNames('diff-hunk-header-content', contentClassName);

        if (elements === undefined) {
            return (
                <tr className={computedClassName}>
                    <td colSpan={2} className={computedGutterClassName} {...boundGutterEvents}></td>
                    <td className={computedContentClassName} {...boundContentEvents}>{hunk.content}</td>
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
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            <HunkHeader
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
