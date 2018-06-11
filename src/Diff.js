import {PureComponent, Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import {bind} from 'lodash-decorators';
import classNames from 'classnames';
import Hunk from './Hunk';
import {viewTypePropType, hunkPropType} from './propTypes';
import './Diff.css';

const findClosest = (target, className) => {
    while (target && target.classList && !target.classList.contains(className)) {
        target = target.parentNode; // eslint-disable-line no-param-reassign
    }

    return target;
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
        const {viewType, optimizeSelection} = this.props;

        if (viewType !== 'split' || !optimizeSelection) {
            return;
        }

        const closestCell = findClosest(target, 'diff-code');

        if (!closestCell) {
            return;
        }

        window.getSelection().removeAllRanges();

        const index = [...closestCell.parentNode.children].indexOf(closestCell);

        if (index !== 1 && index !== 3) {
            return;
        }

        /* eslint-disable no-param-reassign */
        [...this.root.querySelectorAll('.diff-line > td')].forEach(cell => (cell.style.userSelect = 'auto'));
        for (let i = 1; i <= 4; i++) {
            if (i === index + 1) {
                continue;
            }

            const cells = [...this.root.querySelectorAll(`.diff-line > td:nth-child(${i})`)];
            cells.forEach(cell => (cell.style.userSelect = 'none'));
        }
        /* eslint-enable no-param-reassign */
    }

    render() {
        const {diffType, hunks, children, className, ...props} = this.props;
        const monotonous = diffType === 'add' || diffType === 'delete';
        const {hideGutter} = props;
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
                onMouseDown={this.enableColumnSelection}
            >
                {cols}
                {hunksChildren}
            </table>
        );
    }
}
