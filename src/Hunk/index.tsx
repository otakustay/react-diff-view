import {useDiffSettings} from '../context';
import UnifiedHunk from './UnifiedHunk';
import SplitHunk from './SplitHunk';
import {SharedProps, EventMap, HunkTokens} from './interface';
import {HunkData} from '../utils';
import {ReactElement} from 'react';

const EMPTY_EVENT_MAP: EventMap = {};

export interface HunkProps extends SharedProps {
    className?: string;
    lineClassName?: string;
    gutterClassName?: string;
    codeClassName?: string;
    gutterEvents?: EventMap;
    codeEvents?: EventMap;
    hunk: HunkData;
    widgets: Record<string, ReactElement>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens;
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
