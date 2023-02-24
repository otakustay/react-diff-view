import classNames from 'classnames';
import {ReactNode} from 'react';
import {getChangeKey, computeOldLineNumber, computeNewLineNumber, ChangeData, isDelete} from '../../utils';
import {ActualHunkProps} from '../interface';
import UnifiedChange from './UnifiedChange';
import UnifiedWidget from './UnifiedWidget';

type ElementContext = ['change', string, ChangeData] | ['widget', string, ReactNode];

function groupElements(changes: ChangeData[], widgets: Record<string, ReactNode>) {
    return changes.reduce<ElementContext[]>(
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
}

type RenderRowProps = Omit<ActualHunkProps, 'hunk' | 'widgets' | 'className'>;

function renderRow([type, key, value]: ElementContext, props: RenderRowProps) {
    const {hideGutter, selectedChanges, tokens, lineClassName, ...changeProps} = props;

    if (type === 'change') {
        const side = isDelete(value) ? 'old' : 'new';
        const lineNumber = isDelete(value) ? computeOldLineNumber(value) : computeNewLineNumber(value);
        const tokensOfLine = tokens ? tokens[side][lineNumber - 1] : null;

        return (
            <UnifiedChange
                key={`change${key}`}
                className={lineClassName}
                change={value}
                hideGutter={hideGutter}
                selected={selectedChanges.includes(key)}
                tokens={tokensOfLine}
                {...changeProps}
            />
        );
    }
    else if (type === 'widget') {
        return <UnifiedWidget key={`widget${key}`} hideGutter={hideGutter} element={value} />;
    }

    return null;
}

export default function UnifiedHunk(props: ActualHunkProps) {
    const {hunk, widgets, className, ...childrenProps} = props;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            {elements.map(element => renderRow(element, childrenProps))}
        </tbody>
    );
}
