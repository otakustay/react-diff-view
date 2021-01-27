import PropTypes from 'prop-types';
import {useDiffSettings} from '../context';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';

const Hunk = ({hunk, className, ...props}) => {
    const {gutterType, ...context} = useDiffSettings();
    const hideGutter = gutterType === 'none';
    const gutterAnchor = gutterType === 'anchor';
    const RenderingHunk = context.viewType === 'unified' ? UnifiedHunk : SplitHunk;

    return (
        <RenderingHunk
            {...context}
            {...props}
            hunk={hunk}
            hideGutter={hideGutter}
            gutterAnchor={gutterAnchor}
            className={className}
        />
    );
};

Hunk.propTypes = (() => {
    const change = {
        type: PropTypes.oneOf(['delete', 'insert', 'normal']).isRequired,
        content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
        isNormal: PropTypes.bool,
        isInsert: PropTypes.bool,
        isDelete: PropTypes.bool,
        lineNumber: PropTypes.number,
        oldLineNumber: PropTypes.number,
        newLineNumber: PropTypes.number,
    };

    const hunk = {
        oldStart: PropTypes.number.isRequired,
        oldLines: PropTypes.number.isRequired,
        newStart: PropTypes.number.isRequired,
        newLines: PropTypes.number.isRequired,
        content: PropTypes.string.isRequired,
        changes: PropTypes.arrayOf(PropTypes.shape(change)).isRequired,
    };

    return {
        hunk: PropTypes.shape(hunk).isRequired,
        className: PropTypes.string,
        lineClassName: PropTypes.string,
        gutterClassName: PropTypes.string,
        contentClassName: PropTypes.string,
        gutterEvents: PropTypes.object,
        codeEvents: PropTypes.object,
    };
})();

Hunk.defaultProps = {
    className: '',
    lineClassName: '',
    gutterClassName: '',
    contentClassName: '',
    gutterEvents: {},
    codeEvents: {},
};

export default Hunk;
