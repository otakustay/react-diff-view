import {Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Chunk from './Chunk';
import {FILE_TYPE_ADD, FILE_TYPE_DELETE} from './constants';
import {viewTypePropType, chunkPropType} from './propTypes';
import './Diff.css';

const Diff = ({diffType, chunks, children, className, ...props}) => {
    const monotonous = diffType === FILE_TYPE_ADD || diffType === FILE_TYPE_DELETE;
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
    const chunksChildren = children
        ? Children.map(children, child => cloneElement(child, {...props, monotonous}))
        : chunks.map(chunk => <Chunk key={chunk.content} chunk={chunk} monotonous={monotonous} {...props} />);

    return (
        <table className={classNames('diff', className)}>
            {cols}
            {chunksChildren}
        </table>
    );
};

Diff.propTypes = {
    diffType: PropTypes.number.isRequired,
    viewType: viewTypePropType.isRequired,
    chunks: PropTypes.arrayOf(chunkPropType),
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
};

export default Diff;
