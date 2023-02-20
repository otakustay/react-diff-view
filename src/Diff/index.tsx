import {memo, useRef, useCallback, ReactElement, MouseEvent, useMemo} from 'react';
import classNames from 'classnames';
import {ContextProps, GutterType, HunkTokens, Provider, ViewType} from '../context';
import Hunk from '../Hunk';
import {ChangeData, HunkData} from '../utils';
import {RenderToken, RenderGutter} from '../context';

export type DiffType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';

export interface DiffProps {
    diffType: DiffType;
    viewType?: ViewType;
    hunks: HunkData[];
    gutterType?: GutterType;
    generateAnchorID: (change: ChangeData) => string | undefined;
    selectedChanges: string[];
    widgets: Record<string, ReactElement>;
    optimizeSelection?: boolean;
    className?: string;
    tokens: HunkTokens;
    renderToken?: RenderToken;
    renderGutter: RenderGutter;
    children?: (hunks: HunkData[]) => ReactElement[];
}

function noop() {}; // eslint-disable-line no-empty-function

function findClosest(target: HTMLElement, className: string) {
    let current: HTMLElement | null = target;
    while (current && current !== document.documentElement && !current.classList.contains(className)) {
        current = current.parentElement; // eslint-disable-line no-param-reassign
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
        tokens,
        renderToken,
        children = defaultRenderChildren,
        ...remainings
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
    const {gutterType = 'default', viewType = 'split', ...settings} = remainings;
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
        [props.viewType, monotonous]
    );
    const settingsContextValue = useMemo(
        (): ContextProps => ({...settings, monotonous, hideGutter, viewType, gutterType}),
        []
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
