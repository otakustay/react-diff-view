import {Children, cloneElement} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Chunk from './Chunk';
import {viewTypePropType, chunkPropType} from './propTypes';
import './Diff.css';

const Diff = ({chunks, children, className, ...props}) => {
    const cols = props.viewType === 'unified'
        ? (
            <colgroup>
                <col className="diff-gutter-prev-col" />
                <col className="diff-gutter-next-col" />
                <col />
            </colgroup>
        )
        : (
            <colgroup>
                <col className="diff-gutter-prev-col" />
                <col />
                <col className="diff-gutter-next-col" />
                <col />
            </colgroup>
        );
    const chunksChildren = children
        ? Children.map(children, child => cloneElement(child, props))
        : chunks.map(chunk => <Chunk key={chunk.content} chunk={chunk} {...props} />);

    return (
        <table className={classNames('diff', className)}>
            {cols}
            {chunksChildren}
        </table>
    );
};

Diff.propTypes = {
    viewType: viewTypePropType.isRequired,
    chunks: PropTypes.arrayOf(chunkPropType),
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
};

export default Diff;
