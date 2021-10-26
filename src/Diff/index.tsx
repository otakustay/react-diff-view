// @ts-nocheck ignore: third-party
import {memo, useRef, useCallback} from 'react';
import classNames from 'classnames';
import {Provider} from '../context';
import Hunk from '../Hunk';
import {DiffProps} from '../interface';

const noop = () => {}; // eslint-disable-line no-empty-function

const findClosest = (target, className) => {
    while (target && target !== document && !target.classList.contains(className)) {
        target = target.parentNode; // eslint-disable-line no-param-reassign
    }

    return target === document ? null : target;
};

const setUserSelectStyle = (element, selectable) => {
    const value = selectable ? 'auto' : 'none';

    if (element.style.userSelect !== value) {
        element.style.userSelect = value; // eslint-disable-line no-param-reassign
    }
};

function defaultRenderGutter({renderDefault, wrapInAnchor}) {
    return wrapInAnchor(renderDefault());
}

function defaultGenerateAnchorID() {
    return undefined;
}

function defaultChildren(hunks) {
    const key = hunk => `-${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines}`;
    return hunks.map(hunk => <Hunk key={key(hunk)} hunk={hunk} />);
}

function Diff({
    diffType,
    children = defaultChildren,
    className = '',
    optimizeSelection = false,
    hunks,
    viewType,
    gutterType = 'default',
    selectedChanges = [],
    widgets = {},
    renderGutter = defaultRenderGutter,
    generateAnchorID = defaultGenerateAnchorID,
    ...rest
}: DiffProps) {
    const root = useRef<HTMLTableElement>(null);
    const enableColumnSelection = useCallback(
        ({target, button}) => {
            if (button !== 0) {
                return;
            }

            const closestCell = findClosest(target, 'diff-code');

            if (!closestCell) {
                return;
            }

            window.getSelection()?.removeAllRanges();

            const index = [...closestCell.parentNode.children].indexOf(closestCell);

            if (index !== 1 && index !== 3) {
                return;
            }

            const lines = root.current?.querySelectorAll('.diff-line') as NodeListOf<Element>;
            // @ts-expect-error
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
    const cols = ((viewType, monotonous) => {
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
    })(viewType, monotonous);

    return (
        <Provider value={{
            gutterType,
            viewType,
            selectedChanges,
            monotonous,
            widgets,
            renderGutter,
            generateAnchorID,
            ...rest,
        }}
        >
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
