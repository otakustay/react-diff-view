import {memo, useRef, useCallback, ReactElement, MouseEvent, useMemo, ReactNode} from 'react';
import classNames from 'classnames';
import {
    ContextProps,
    EventMap,
    GutterType,
    Provider,
    ViewType,
    RenderToken,
    RenderGutter,
    DEFAULT_CONTEXT_VALUE,
} from '../context';
import Hunk from '../Hunk';
import {ChangeData, HunkData} from '../utils';
import {HunkTokens} from '../tokenize';

export type DiffType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';

export interface DiffProps {
    diffType: DiffType;
    hunks: HunkData[];
    viewType?: ViewType;
    gutterType?: GutterType;
    generateAnchorID?: (change: ChangeData) => string | undefined;
    selectedChanges?: string[];
    widgets?: Record<string, ReactNode>;
    optimizeSelection?: boolean;
    className?: string;
    hunkClassName?: string;
    lineClassName?: string;
    generateLineClassName?: (params: {changes: ChangeData[], defaultGenerate: () => string}) => string | undefined;
    gutterClassName?: string;
    codeClassName?: string;
    tokens?: HunkTokens | null;
    renderToken?: RenderToken;
    renderGutter?: RenderGutter;
    gutterEvents?: EventMap;
    codeEvents?: EventMap;
    children?: (hunks: HunkData[]) => ReactElement | ReactElement[];
}

function noop() {}

function findClosest(target: HTMLElement, className: string) {
    let current: HTMLElement | null = target;
    while (current && current !== document.documentElement && !current.classList.contains(className)) {
        current = current.parentElement;
    }

    return current === document.documentElement ? null : current;
}

function setUserSelectStyle(element: Element, selectable: boolean) {
    const value = selectable ? 'auto' : 'none';

    if (element instanceof HTMLElement && element.style.userSelect !== value) {
        element.style.userSelect = value; // eslint-disable-line no-param-reassign
    }
}

function defaultRenderChildren(hunks: HunkData[]) {
    const key = (hunk: HunkData) => `-${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines}`;
    return hunks.map(hunk => <Hunk key={key(hunk)} hunk={hunk} />);
}

function Diff(props: DiffProps) {
    const {
        diffType,
        hunks,
        optimizeSelection,
        className,
        hunkClassName = DEFAULT_CONTEXT_VALUE.hunkClassName,
        lineClassName = DEFAULT_CONTEXT_VALUE.lineClassName,
        generateLineClassName = DEFAULT_CONTEXT_VALUE.generateLineClassName,
        gutterClassName = DEFAULT_CONTEXT_VALUE.gutterClassName,
        codeClassName = DEFAULT_CONTEXT_VALUE.codeClassName,
        gutterType = DEFAULT_CONTEXT_VALUE.gutterType,
        viewType = DEFAULT_CONTEXT_VALUE.viewType,
        gutterEvents = DEFAULT_CONTEXT_VALUE.gutterEvents,
        codeEvents = DEFAULT_CONTEXT_VALUE.codeEvents,
        generateAnchorID = DEFAULT_CONTEXT_VALUE.generateAnchorID,
        selectedChanges = DEFAULT_CONTEXT_VALUE.selectedChanges,
        widgets = DEFAULT_CONTEXT_VALUE.widgets,
        renderGutter = DEFAULT_CONTEXT_VALUE.renderGutter,
        tokens,
        renderToken,
        children = defaultRenderChildren,
    } = props;
    const root = useRef<HTMLTableElement>(null);
    const enableColumnSelection = useCallback(
        ({target, button}: MouseEvent<HTMLElement>) => {
            if (button !== 0) {
                return;
            }

            const closestCell = findClosest(target as HTMLElement, 'diff-code');

            if (!closestCell || !closestCell.parentElement) {
                return;
            }

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }

            const index = [...closestCell.parentElement.children].indexOf(closestCell);

            if (index !== 1 && index !== 3) {
                return;
            }

            const lines = root.current ? root.current.querySelectorAll('.diff-line') : [];
            for (const line of lines) {
                const cells = line.children;
                setUserSelectStyle(cells[1], index === 1);
                setUserSelectStyle(cells[3], index === 3);
            }
        },
        []
    );
    const hideGutter = gutterType === 'none';
    const monotonous = diffType === 'add' || diffType === 'delete';
    const onTableMouseDown = (viewType === 'split' && !monotonous && optimizeSelection) ? enableColumnSelection : noop;
    const cols = useMemo(
        () => {
            if (viewType === 'unified') {
                return (
                    <colgroup>
                        {!hideGutter && <col className="diff-gutter-col" />}
                        {!hideGutter && <col className="diff-gutter-col" />}
                        <col />
                    </colgroup>
                );
            }

            if (monotonous) {
                return (
                    <colgroup>
                        {!hideGutter && <col className="diff-gutter-col" />}
                        <col />
                    </colgroup>
                );
            }

            return (
                <colgroup>
                    {!hideGutter && <col className="diff-gutter-col" />}
                    <col />
                    {!hideGutter && <col className="diff-gutter-col" />}
                    <col />
                </colgroup>
            );
        },
        [viewType, monotonous, hideGutter]
    );
    // TODO: in later versions, we can split context into multiple to reduce component render
    const settingsContextValue = useMemo(
        (): ContextProps => {
            return {
                hunkClassName,
                lineClassName,
                generateLineClassName,
                gutterClassName,
                codeClassName,
                monotonous,
                hideGutter,
                viewType,
                gutterType,
                codeEvents,
                gutterEvents,
                generateAnchorID,
                selectedChanges,
                widgets,
                renderGutter,
                tokens,
                renderToken,
            };
        },
        [
            codeClassName,
            codeEvents,
            generateAnchorID,
            gutterClassName,
            gutterEvents,
            gutterType,
            hideGutter,
            hunkClassName,
            lineClassName,
            generateLineClassName,
            monotonous,
            renderGutter,
            renderToken,
            selectedChanges,
            tokens,
            viewType,
            widgets,
        ]
    );

    return (
        <Provider value={settingsContextValue}>
            <table
                ref={root}
                className={classNames('diff', `diff-${viewType}`, className)}
                onMouseDown={onTableMouseDown}
            >
                {cols}
                {children(hunks)}
            </table>
        </Provider>
    );
}

export default memo(Diff);
