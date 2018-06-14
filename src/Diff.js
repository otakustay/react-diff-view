import {PureComponent, Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import {bind} from 'lodash-decorators';
import classNames from 'classnames';
import Hunk from './Hunk';
import {viewTypePropType, hunkPropType} from './propTypes';
import './Diff.css';

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

export default class Diff extends PureComponent {

    static propTypes = {
        // TODO: [2.x] `diffType` should be required.
        diffType: PropTypes.oneOf(['add', 'delete', 'modify', 'rename', 'copy']),
        viewType: viewTypePropType.isRequired,
        // TODO: [2.x] Merge `hideGutter` and `gutterAnchor` into `gutterType`
        hideGutter: PropTypes.bool,
        hunks: PropTypes.arrayOf(hunkPropType),
        gutterAnchor: PropTypes.bool,
        generateAnchorID: PropTypes.func,
        optimizeSelection: PropTypes.bool,
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
    };

    static defaultProps = {
        diffType: 'modify',
        hunks: undefined,
        children: undefined,
        hideGutter: false,
        gutterAnchor: false,
        optimizeSelection: false,
        generateAnchorID() {
            return undefined;
        }
    };

    root = null;

    @bind()
    enableColumnSelection({target}) {
        const closestCell = findClosest(target, 'diff-code');

        if (!closestCell) {
            return;
        }

        window.getSelection().removeAllRanges();

        const index = [...closestCell.parentNode.children].indexOf(closestCell);

        if (index !== 1 && index !== 3) {
            return;
        }

        const lines = this.root.querySelectorAll('.diff-line');
        for (const line of lines) {
            const cells = line.children;
            setUserSelectStyle(cells[1], index === 1);
            setUserSelectStyle(cells[3], index === 3);
        }
    }

    render() {
        const {diffType, hunks, children, className, optimizeSelection, ...props} = this.props;
        const {hideGutter, viewType} = props;
        const monotonous = diffType === 'add' || diffType === 'delete';
        const onTableMouseDown = (viewType === 'split' && !monotonous && optimizeSelection)
            ? this.enableColumnSelection
            : noop;
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
        const hunksChildren = children
            ? Children.map(children, child => cloneElement(child, {...props, monotonous}))
            : hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} monotonous={monotonous} {...props} />);

        return (
            <table
                ref={element => (this.root = element)}
                className={classNames('diff', className)}
                onMouseDown={onTableMouseDown}
            >
                {cols}
                {hunksChildren}
            </table>
        );
    }
}
