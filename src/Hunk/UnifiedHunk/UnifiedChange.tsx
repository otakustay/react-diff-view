import {memo, useState, useMemo, useCallback} from 'react';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import {ChangeData} from '../../utils';
import {TokenNode} from '../../tokenize';
import {GutterOptions, RenderGutter} from '../../context';
import {ChangeEventArgs, ChangeSharedProps, EventMap, NativeEventMap} from '../interface';
import CodeCell from '../CodeCell';
import {composeCallback, renderDefaultBy, wrapInAnchorBy} from '../utils';

interface UnifiedChangeProps extends ChangeSharedProps {
    change: ChangeData;
    tokens: TokenNode[] | null;
    className: string;
    selected: boolean;
}

function useBoundCallbacks(callbacks: EventMap, arg: ChangeEventArgs, hoverOn: () => void, hoverOff: () => void) {
    return useMemo(
        () => {
            const output: NativeEventMap = mapValues(callbacks, fn => (e: any) => fn && fn(arg, e));
            output.onMouseEnter = composeCallback(hoverOn, output.onMouseEnter);
            output.onMouseLeave = composeCallback(hoverOff, output.onMouseLeave);
            return output;
        },
        [callbacks, hoverOn, hoverOff, arg]
    );
}

function useBoolean() {
    const [value, setValue] = useState(false);
    const on = useCallback(() => setValue(true), []);
    const off = useCallback(() => setValue(false), []);
    return [value, on, off] as const;
}

function renderGutterCell(
    className: string,
    change: ChangeData,
    side: 'old' | 'new',
    gutterAnchor: boolean,
    anchorTarget: string | undefined,
    events: NativeEventMap,
    inHoverState: boolean,
    renderGutter: RenderGutter
) {
    const gutterOptions: GutterOptions = {
        change,
        side,
        inHoverState,
        renderDefault: renderDefaultBy(change, side),
        wrapInAnchor: wrapInAnchorBy(gutterAnchor, anchorTarget),
    };

    return (
        <td className={className} {...events}>
            {renderGutter(gutterOptions)}
        </td>
    );
};

function UnifiedChange(props: UnifiedChangeProps) {
    const {
        change,
        selected,
        tokens,
        className,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        hideGutter,
        gutterAnchor,
        generateAnchorID,
        renderToken,
        renderGutter,
    } = props;
    const {type, content} = change;

    const [hover, hoverOn, hoverOff] = useBoolean();
    const eventArg = useMemo(() => ({change}), [change]);
    const boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg, hoverOn, hoverOff);
    const boundCodeEvents = useBoundCallbacks(codeEvents, eventArg, hoverOn, hoverOff);

    const anchorID = generateAnchorID(change);
    const gutterClassNameValue = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        gutterClassName,
        {'diff-gutter-selected': selected}
    );
    const codeClassNameValue = classNames(
        'diff-code',
        `diff-code-${type}`,
        codeClassName,
        {'diff-code-selected': selected}
    );

    return (
        <tr id={anchorID} className={classNames('diff-line', className)}>
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    'old',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter
                )
            }
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    'new',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter
                )
            }
            <CodeCell
                className={codeClassNameValue}
                text={content}
                tokens={tokens}
                renderToken={renderToken}
                {...boundCodeEvents}
            />
        </tr>
    );
}

export default memo(UnifiedChange);
