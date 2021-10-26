// @ts-nocheck ignore: third-party
import {useDiffSettings} from '../context';
import {HunkProps} from '../interface';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';

function Hunk({hunk, gutterEvents = {}, codeEvents = {}, className, ...props}: HunkProps) {
    const {gutterType, ...context} = useDiffSettings();
    const hideGutter = gutterType === 'none';
    const gutterAnchor = gutterType === 'anchor';
    const RenderingHunk = context.viewType === 'unified' ? UnifiedHunk : SplitHunk;

    return (
        <RenderingHunk
            {...context}
            {...props}
            gutterEvents={gutterEvents}
            codeEvents={codeEvents}
            hunk={hunk}
            hideGutter={hideGutter}
            gutterAnchor={gutterAnchor}
            className={className}
        />
    );
}

export default Hunk;
