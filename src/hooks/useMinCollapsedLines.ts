import {useMemo} from 'react';
import {expandCollapsedBlockBy, HunkData, Source} from '../utils';

export default function useMinCollapsedLines(minLinesExclusive: number, hunks: HunkData[], oldSource: Source | null) {
    const renderingHunks = useMemo(
        () => {
            if (!oldSource) {
                return hunks;
            }

            const predicate = (lines: number) => lines < minLinesExclusive;
            return expandCollapsedBlockBy(hunks, oldSource, predicate);
        },
        [minLinesExclusive, hunks, oldSource]
    );
    return renderingHunks;
}
