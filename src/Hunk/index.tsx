import {useDiffSettings} from '../context';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';
import {HunkData} from '../utils';

export interface HunkProps {
    hunk: HunkData;
}

function Hunk({hunk}: HunkProps) {
    const {gutterType, hunkClassName, ...context} = useDiffSettings();
    const hideGutter = gutterType === 'none';
    const gutterAnchor = gutterType === 'anchor';
    const RenderingHunk = context.viewType === 'unified' ? UnifiedHunk : SplitHunk;

    return (
        <RenderingHunk
            {...context}
            hunk={hunk}
            hideGutter={hideGutter}
            gutterAnchor={gutterAnchor}
            className={hunkClassName}
        />
    );
}

export default Hunk;
