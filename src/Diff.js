import {Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Hunk from './Hunk';
import {viewTypePropType, hunkPropType} from './propTypes';
import './Diff.css';

const Diff = ({diffType, hunks, children, className, ...props}) => {
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
        <table className={classNames('diff', className)}>
            {cols}
            {hunksChildren}
        </table>
    );
};

Diff.propTypes = {
    // TODO: [2.x] `diffType` should be required.
    diffType: PropTypes.oneOf(['add', 'delete', 'modify', 'rename', 'copy']),
    viewType: viewTypePropType.isRequired,
    // TODO: [2.x] Merge `hideGutter` and `gutterAnchor` into `gutterType`
    hideGutter: PropTypes.bool,
    hunks: PropTypes.arrayOf(hunkPropType),
    gutterAnchor: PropTypes.bool,
    generateAnchorID: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
};

Diff.defaultProps = {
    diffType: 'modify',
    hunks: undefined,
    children: undefined,
    hideGutter: false,
    gutterAnchor: false,
    generateAnchorID() {
        return undefined;
    }
};

export default Diff;
