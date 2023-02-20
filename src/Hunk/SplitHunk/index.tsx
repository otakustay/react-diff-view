import classNames from 'classnames';
import {ReactElement} from 'react';
import {getChangeKey, computeOldLineNumber, computeNewLineNumber, ChangeData} from '../../utils';
import {HunkProps} from '../interface';
import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';

type ChangeContext = ['change', string, ChangeData | null, ChangeData | null];

type WidgetContext = ['widget', string,  ReactElement | null, ReactElement | null];

type ElementContext = ChangeContext | WidgetContext;

function keyForPair(x: ChangeData | null, y: ChangeData | null) {
    const keyForX = x ? getChangeKey(x) : '00';
    const keyForY = y ? getChangeKey(y) : '00';
    return keyForX + keyForY;
}

function groupElements(changes: ChangeData[], widgets: Record<string, ReactElement>) {
    const findWidget = (change: ChangeData | null) => {
        if (!change) {
            return null;
        }

        const key = getChangeKey(change);
        return widgets[key] || null;
    };
    const elements: ElementContext[] = [];

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

        const rowChanges = elements[elements.length - 1] as ChangeContext;
        const oldWidget = findWidget(rowChanges[2]);
        const newWidget = findWidget(rowChanges[3]);
        if (oldWidget || newWidget) {
            const key = rowChanges[1];
            elements.push(['widget', key, oldWidget, newWidget]);
        }
    }

    return elements;
};


type RenderRowProps = Omit<HunkProps, 'hunk' | 'widgets' | 'className'>;

function renderRow([type, key, oldValue, newValue]: ElementContext, props: RenderRowProps) {
    const {
        selectedChanges,
        monotonous,
        hideGutter,
        tokens,
        lineClassName,
        ...changeProps
    } = props;

    if (type === 'change') {
        const oldSelected = oldValue ? selectedChanges.includes(getChangeKey(oldValue)) : false;
        const newSelected = newValue ? selectedChanges.includes(getChangeKey(newValue)) : false;
        const oldTokens = (oldValue && tokens) ? tokens.old[computeOldLineNumber(oldValue) - 1] : null;
        const newTokens = (newValue && tokens) ? tokens.new[computeNewLineNumber(newValue) - 1] : null;

        return (
            <SplitChange
                key={`change${key}`}
                className={lineClassName}
                oldChange={oldValue}
                newChange={newValue}
                monotonous={monotonous}
                hideGutter={hideGutter}
                oldSelected={oldSelected}
                newSelected={newSelected}
                oldTokens={oldTokens}
                newTokens={newTokens}
                {...changeProps}
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

export default function SplitHunk(props: HunkProps) {
    const {hunk, widgets, className, ...childrenProps} = props;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            {elements.map(item => renderRow(item, childrenProps))}
        </tbody>
    );
}
