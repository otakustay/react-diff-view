import {memo, useRef, useCallback} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Provider} from '../context';
import Hunk from '../Hunk';
import './index.css';

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

const Diff = props => {
    const root = useRef(null);
    const enableColumnSelection = useCallback(
        ({target}) => {
            const closestCell = findClosest(target, 'diff-code');

            if (!closestCell) {
                return;
            }

            window.getSelection().removeAllRanges();

            const index = [...closestCell.parentNode.children].indexOf(closestCell);

            if (index !== 1 && index !== 3) {
                return;
            }

            const lines = root.current.querySelectorAll('.diff-line');
            for (const line of lines) {
                const cells = line.children;
                setUserSelectStyle(cells[1], index === 1);
                setUserSelectStyle(cells[3], index === 3);
            }
        },
        []
    );

    const {diffType, children, className, optimizeSelection, hunks, ...remainings} = props;
    const {gutterType, viewType} = remainings;
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
    })(props.viewType, monotonous);

    return (
        <Provider value={{...remainings, monotonous}}>
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
};

Diff.propTypes = {
    diffType: PropTypes.oneOf(['add', 'delete', 'modify', 'rename', 'copy']).isRequired,
    viewType: PropTypes.oneOf(['unified', 'split']).isRequired,
    hunks: PropTypes.arrayOf(PropTypes.object).isRequired,
    gutterType: PropTypes.oneOf(['default', 'none', 'anchor']),
    generateAnchorID: PropTypes.func,
    selectedChanges: PropTypes.arrayOf(PropTypes.string),
    widgets: PropTypes.objectOf(PropTypes.node),
    optimizeSelection: PropTypes.bool,
    className: PropTypes.string,
    renderToken: PropTypes.func,
    children: PropTypes.func,
};

Diff.defaultProps = {
    gutterType: 'default',
    optimizeSelection: false,
    selectedChanges: [],
    widgets: {},
    className: '',
    renderToken: undefined,
    generateAnchorID() {
        return undefined;
    },
    children(hunks) {
        const key = hunk => `-${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines}`;
        return hunks.map(hunk => <Hunk key={key(hunk)} hunk={hunk} />);
    },
};

export default memo(Diff);
