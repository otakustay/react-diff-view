import {Whether} from 'react-whether';
import {getCollapsedLinesCountBetween} from '../src';
import Unfold from './Unfold';

const HunkHeader = ({previousHunk, currentHunk, rawCodeLines, onExpand}) => {
    if (currentHunk.content === 'STUB') {
        const nextStart = currentHunk.oldStart + currentHunk.oldLines;
        const collapsedLines = rawCodeLines.length - nextStart + 1;

        return (
            <div>
                <Whether matches={collapsedLines > 10}>
                    <Unfold direction="none" start={nextStart} end={rawCodeLines.length + 1} onExpand={onExpand} />
                </Whether>
                <Unfold direction="down" start={nextStart} end={nextStart + 10} onExpand={onExpand} />
            </div>
        );
    }

    const collapsedLines = getCollapsedLinesCountBetween(previousHunk, currentHunk);

    if (!previousHunk) {
        if (!collapsedLines) {
            return null;
        }

        const start = Math.max(currentHunk.oldStart - 10, 1);

        return (
            <div>
                <Whether matches={collapsedLines > 10}>
                    <Unfold direction="none" start={1} end={currentHunk.oldStart} onExpand={onExpand} />
                </Whether>
                <Unfold direction="up" start={start} end={currentHunk.oldStart} onExpand={onExpand} />
            </div>
        );
    }

    const collapsedStart = previousHunk.oldStart + previousHunk.oldLines;
    const collapsedEnd = currentHunk.oldStart;

    if (collapsedLines < 10) {
        return (
            <div>
                <Unfold direction="none" start={collapsedStart} end={collapsedEnd} onExpand={onExpand} />
            </div>
        );
    }

    return (
        <div>
            <Unfold direction="down" start={collapsedStart} end={collapsedStart + 10} onExpand={onExpand} />
            <Unfold direction="none" start={collapsedStart} end={collapsedEnd} onExpand={onExpand} />
            <Unfold direction="up" start={collapsedEnd - 10} end={collapsedEnd} onExpand={onExpand} />
        </div>
    );
};

export default HunkHeader;
