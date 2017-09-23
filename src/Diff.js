import {Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Hunk from './Hunk';
import {viewTypePropType, hunkPropType} from './propTypes';
import './Diff.css';

const Diff = ({diffType, hunks, children, className, ...props}) => {
    const monotonous = diffType === 'add' || diffType === 'delete';
    const cols = ((viewType, monotonous) => {
        if (viewType === 'unified') {
            return (
                <colgroup>
                    <col className="diff-gutter-col" />
                    <col className="diff-gutter-col" />
                    <col />
                </colgroup>
            );
        }

        if (monotonous) {
            return (
                <colgroup>
                    <col className="diff-gutter-col" />
                    <col />
                </colgroup>
            );
        }

        return (
            <colgroup>
                <col className="diff-gutter-col" />
                <col />
                <col className="diff-gutter-col" />
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
    diffType: PropTypes.oneOf(['add', 'delete', 'modify', 'rename', 'copy']),
    viewType: viewTypePropType.isRequired,
    hunks: PropTypes.arrayOf(hunkPropType),
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
};

export default Diff;
