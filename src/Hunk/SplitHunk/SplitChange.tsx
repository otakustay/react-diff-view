import {memo, useState, useMemo, useCallback} from 'react';
import classNames from 'classnames';
import {mapValues} from 'lodash';
import {ChangeData, getChangeKey} from '../../utils';
import {TokenNode} from '../../tokenize';
import {Side} from '../../interface';
import {RenderToken, RenderGutter, GutterOptions, EventMap, NativeEventMap} from '../../context';
import {ChangeSharedProps} from '../interface';
import CodeCell from '../CodeCell';
import {composeCallback, renderDefaultBy, wrapInAnchorBy} from '../utils';

const SIDE_OLD = 0;
const SIDE_NEW = 1;

type SetHover = (side: Side | '') => void;

function useCallbackOnSide(side: Side, setHover: SetHover, change: ChangeData | null, customCallbacks: EventMap) {
    const markHover = useCallback(() => setHover(side), [side, setHover]);
    const unmarkHover = useCallback(() => setHover(''), [setHover]);
    // Unlike selectors, hooks do not provide native functionality to customize comparator,
    // on realizing that this does not reduce amount of renders, only preventing duplicate merge computations,
    // we decide not to optimize this extremely, leave it recomputed on certain rerenders.
    const callbacks = useMemo(
        () => {
            const callbacks: NativeEventMap = mapValues(customCallbacks, fn => (e: any) => fn && fn({side, change}, e));
            callbacks.onMouseEnter = composeCallback(markHover, callbacks.onMouseEnter);
            callbacks.onMouseLeave = composeCallback(unmarkHover, callbacks.onMouseLeave);
            return callbacks;
        },
        [change, customCallbacks, markHover, side, unmarkHover]
    );
    return callbacks;
}

interface RenderCellArgs {
    change: ChangeData | null;
    side: typeof SIDE_OLD | typeof SIDE_NEW;
    selected: boolean;
    tokens: TokenNode[] | null;
    gutterClassName: string;
    codeClassName: string;
    gutterEvents: NativeEventMap;
    codeEvents: NativeEventMap;
    anchorID: string | null | undefined;
    gutterAnchor: boolean;
    gutterAnchorTarget: string | null | undefined;
    hideGutter: boolean;
    hover: boolean;
    renderToken: RenderToken | undefined;
    renderGutter: RenderGutter;
}

function renderCells(args: RenderCellArgs) {
    const {
        change,
        side,
        selected,
        tokens,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        anchorID,
        gutterAnchor,
        gutterAnchorTarget,
        hideGutter,
        hover,
        renderToken,
        renderGutter,
    } = args;

    if (!change) {
        const gutterClassNameValue = classNames('diff-gutter', 'diff-gutter-omit', gutterClassName);
        const codeClassNameValue = classNames('diff-code', 'diff-code-omit', codeClassName);

        return [
            !hideGutter && <td key="gutter" className={gutterClassNameValue} />,
            <td key="code" className={codeClassNameValue} />,
        ];
    }

    const {type, content} = change;
    const changeKey = getChangeKey(change);
    const sideName = side === SIDE_OLD ? 'old' : 'new';
    const gutterClassNameValue = classNames(
        'diff-gutter',
        `diff-gutter-${type}`,
        {
            'diff-gutter-selected': selected,
            ['diff-line-hover-' + sideName]: hover,
        },
        gutterClassName
    );
    const gutterOptions: GutterOptions = {
        change,
        side: sideName,
        inHoverState: hover,
        renderDefault: renderDefaultBy(change, sideName),
        wrapInAnchor: wrapInAnchorBy(gutterAnchor, gutterAnchorTarget),
    };
    const gutterProps = {
        id: anchorID || undefined,
        className: gutterClassNameValue,
        children: renderGutter(gutterOptions),
        ...gutterEvents,
    };
    const codeClassNameValue = classNames(
        'diff-code',
        `diff-code-${type}`,
        {
            'diff-code-selected': selected,
            ['diff-line-hover-' + sideName]: hover,
        },
        codeClassName
    );

    return [
        !hideGutter && <td key="gutter" {...gutterProps} data-change-key={changeKey} />,
        <CodeCell
            key="code"
            className={codeClassNameValue}
            changeKey={changeKey}
            text={content}
            tokens={tokens}
            renderToken={renderToken}
            {...codeEvents}
        />,
    ];
}

interface SplitChangeProps extends ChangeSharedProps {
    className: string;
    oldChange: ChangeData | null;
    newChange: ChangeData | null;
    oldSelected: boolean;
    newSelected: boolean;
    oldTokens: TokenNode[] | null;
    newTokens: TokenNode[] | null;
    monotonous: boolean;
}

function SplitChange(props: SplitChangeProps) {
    const {
        className,
        oldChange,
        newChange,
        oldSelected,
        newSelected,
        oldTokens,
        newTokens,
        monotonous,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        hideGutter,
        generateAnchorID,
        generateLineClassName,
        gutterAnchor,
        renderToken,
        renderGutter,
    } = props;

    const [hover, setHover] = useState('');
    const oldGutterEvents = useCallbackOnSide('old', setHover, oldChange, gutterEvents);
    const newGutterEvents = useCallbackOnSide('new', setHover, newChange, gutterEvents);
    const oldCodeEvents = useCallbackOnSide('old', setHover, oldChange, codeEvents);
    const newCodeEvents = useCallbackOnSide('new', setHover, newChange, codeEvents);
    const oldAnchorID = oldChange && generateAnchorID(oldChange);
    const newAnchorID = newChange && generateAnchorID(newChange);

    const lineClassName = generateLineClassName({
        changes: [oldChange!, newChange!],
        defaultGenerate: () => className,
    });

    const commons = {
        monotonous,
        hideGutter,
        gutterClassName,
        codeClassName,
        gutterEvents,
        codeEvents,
        renderToken,
        renderGutter,
    };
    const oldArgs: RenderCellArgs = {
        ...commons,
        change: oldChange,
        side: SIDE_OLD,
        selected: oldSelected,
        tokens: oldTokens,
        gutterEvents: oldGutterEvents,
        codeEvents: oldCodeEvents,
        anchorID: oldAnchorID,
        gutterAnchor: gutterAnchor,
        gutterAnchorTarget: oldAnchorID,
        hover: hover === 'old',
    };
    const newArgs: RenderCellArgs = {
        ...commons,
        change: newChange,
        side: SIDE_NEW,
        selected: newSelected,
        tokens: newTokens,
        gutterEvents: newGutterEvents,
        codeEvents: newCodeEvents,
        anchorID: oldChange === newChange ? null : newAnchorID,
        gutterAnchor: gutterAnchor,
        gutterAnchorTarget: oldChange === newChange ? oldAnchorID : newAnchorID,
        hover: hover === 'new',
    };

    if (monotonous) {
        return (
            <tr className={classNames('diff-line', lineClassName)}>
                {renderCells(oldChange ? oldArgs : newArgs)}
            </tr>
        );
    }

    const lineTypeClassName = ((oldChange, newChange) => {
        if (oldChange && !newChange) {
            return 'diff-line-old-only';
        }

        if (!oldChange && newChange) {
            return 'diff-line-new-only';
        }

        if (oldChange === newChange) {
            return 'diff-line-normal';
        }

        return 'diff-line-compare';
    })(oldChange, newChange);

    return (
        <tr className={classNames('diff-line', lineTypeClassName, lineClassName)}>
            {renderCells(oldArgs)}
            {renderCells(newArgs)}
        </tr>
    );
}

export default memo(SplitChange);
