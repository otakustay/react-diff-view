import {PureComponent} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Provider} from '../context';
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

export default class Diff extends PureComponent {

    static propTypes = {
        diffType: PropTypes.oneOf(['add', 'delete', 'modify', 'rename', 'copy']).isRequired,
        viewType: PropTypes.oneOf(['unified', 'split']).isRequired,
        gutterType: PropTypes.oneOf(['default', 'none', 'anchor']),
        generateAnchorID: PropTypes.func,
        selectedChanges: PropTypes.arrayOf(PropTypes.string),
        widgets: PropTypes.objectOf(PropTypes.node),
        optimizeSelection: PropTypes.bool,
        className: PropTypes.string,
        renderToken: PropTypes.func,
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]).isRequired
    };

    static defaultProps = {
        children: undefined,
        gutterType: 'default',
        optimizeSelection: false,
        selectedChanges: [],
        widgets: {},
        className: '',
        renderToken: undefined,
        generateAnchorID() {
            return undefined;
        }
    };

    root = null;

    enableColumnSelection = ({target}) => {
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
    };

    render() {
        const {diffType, children, className, optimizeSelection, ...props} = this.props;
        const {gutterType, viewType} = props;
        const hideGutter = gutterType === 'none';
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

        return (
            <Provider value={{...props, monotonous}}>
                <table
                    ref={element => (this.root = element)}
                    className={classNames('diff', `diff-${viewType}`, className)}
                    onMouseDown={onTableMouseDown}
                >
                    {cols}
                    {children}
                </table>
            </Provider>
        );
    }
}
