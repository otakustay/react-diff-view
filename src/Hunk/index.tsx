import {useDiffSettings} from '../context';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';
import {EventMap} from './interface';
import {HunkData} from '../utils';

export type {EventMap, ChangeEventArgs} from './interface';

const EMPTY_EVENT_MAP: EventMap = {};

export interface HunkProps {
    className?: string;
    lineClassName?: string;
    gutterClassName?: string;
    codeClassName?: string;
    gutterEvents?: EventMap;
    codeEvents?: EventMap;
    hunk: HunkData;
}

function Hunk(props: HunkProps) {
    const {
        className = '',
        lineClassName = '',
        gutterClassName = '',
        codeClassName = '',
        gutterEvents = EMPTY_EVENT_MAP,
        codeEvents = EMPTY_EVENT_MAP,
        ...hunkProps
    } = props;
    const {gutterType, ...context} = useDiffSettings();
    const hideGutter = gutterType === 'none';
    const gutterAnchor = gutterType === 'anchor';
    const RenderingHunk = context.viewType === 'unified' ? UnifiedHunk : SplitHunk;

    return (
        <RenderingHunk
            {...context}
            {...hunkProps}
            hideGutter={hideGutter}
            gutterAnchor={gutterAnchor}
            className={className}
            lineClassName={lineClassName}
            gutterClassName={gutterClassName}
            codeClassName={codeClassName}
            gutterEvents={gutterEvents}
            codeEvents={codeEvents}
        />
    );
};

export default Hunk;
