import PropTypes from 'prop-types';
import {Consumer} from '../context';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';

const Hunk = ({hunk}) => (
    <Consumer>
        {
            ({gutterType, ...context}) => {
                const {viewType, customClassNames} = context;
                const hideGutter = gutterType === 'none';
                const gutterAnchor = gutterType === 'anchor';
                const RenderingHunk = viewType === 'unified' ? UnifiedHunk : SplitHunk;

                return (
                    <RenderingHunk
                        {...context}
                        hunk={hunk}
                        hideGutter={hideGutter}
                        gutterAnchor={gutterAnchor}
                        className={customClassNames.hunk}
                    />
                );
            }
        }
    </Consumer>
);

Hunk.propTypes = (() => {
    const change = {
        type: PropTypes.oneOf(['delete', 'insert', 'normal']).isRequired,
        content: PropTypes.string.isRequired,
        isNormal: PropTypes.bool,
        isInsert: PropTypes.bool,
        isDelete: PropTypes.bool,
        lineNumber: PropTypes.number,
        oldLineNumber: PropTypes.number,
        newLineNumber: PropTypes.number
    };

    const hunk = {
        oldStart: PropTypes.number.isRequired,
        oldLines: PropTypes.number.isRequired,
        newStart: PropTypes.number.isRequired,
        newLines: PropTypes.number.isRequired,
        content: PropTypes.string.isRequired,
        changes: PropTypes.arrayOf(PropTypes.shape(change)).isRequired
    };

    return {
        hunk: PropTypes.shape(hunk).isRequired
    };
})();

export default Hunk;
