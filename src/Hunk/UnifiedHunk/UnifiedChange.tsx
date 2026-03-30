import {memo, useState, useMemo, useCallback} from 'react';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import {ChangeData, getChangeKey} from '../../utils';
import {TokenNode} from '../../tokenize';
import {Side} from '../../interface';
import {ChangeEventArgs, EventMap, GutterOptions, NativeEventMap, RenderGutter} from '../../context';
import {ChangeSharedProps} from '../interface';
import CodeCell from '../CodeCell';
import {composeCallback, renderDefaultBy, wrapInAnchorBy} from '../utils';
import {getGutterAriaLabel, getCodeCellAriaLabel} from '../accessibility';

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
    changeKey: string,
    side: Side,
    gutterAnchor: boolean,
    anchorTarget: string | undefined,
    events: NativeEventMap,
    inHoverState: boolean,
    renderGutter: RenderGutter,
    gutterAriaLabel?: string
) {
    const gutterOptions: GutterOptions = {
        change,
        side,
        inHoverState,
        renderDefault: renderDefaultBy(change, side),
        wrapInAnchor: wrapInAnchorBy(gutterAnchor, anchorTarget),
    };

    return (
        <td
            className={className}
            {...events}
            data-change-key={changeKey}
            {...(gutterAriaLabel && {'aria-label': gutterAriaLabel})}
        >
            {renderGutter(gutterOptions)}
        </td>
    );
}

function UnifiedChange(props: UnifiedChangeProps) {
    const {
        change,
        selected,
        tokens,
        className,
        generateLineClassName,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        hideGutter,
        gutterAnchor,
        generateAnchorID,
        renderToken,
        renderGutter,
        accessibility,
    } = props;
    const {type, content} = change;
    const changeKey = getChangeKey(change);

    const [hover, hoverOn, hoverOff] = useBoolean();
    const eventArg = useMemo(() => ({change}), [change]);
    const boundGutterEvents = useBoundCallbacks(gutterEvents, eventArg, hoverOn, hoverOff);
    const boundCodeEvents = useBoundCallbacks(codeEvents, eventArg, hoverOn, hoverOff);

    const anchorID = generateAnchorID(change);
    const lineClassName = generateLineClassName({
        changes: [change],
        defaultGenerate: () => className,
    });

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
        <tr id={anchorID} className={classNames('diff-line', lineClassName)}>
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    changeKey,
                    'old',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter,
                    accessibility === 'screen-reader' ? getGutterAriaLabel(change, 'old') : undefined
                )
            }
            {
                !hideGutter && renderGutterCell(
                    gutterClassNameValue,
                    change,
                    changeKey,
                    'new',
                    gutterAnchor,
                    anchorID,
                    boundGutterEvents,
                    hover,
                    renderGutter,
                    accessibility === 'screen-reader' ? getGutterAriaLabel(change, 'new') : undefined
                )
            }
            <CodeCell
                className={codeClassNameValue}
                changeKey={changeKey}
                text={content}
                tokens={tokens}
                renderToken={renderToken}
                screenReaderLabel={accessibility === 'screen-reader' ? getCodeCellAriaLabel(change) : undefined}
                {...boundCodeEvents}
            />
        </tr>
    );
}

export default memo(UnifiedChange);
