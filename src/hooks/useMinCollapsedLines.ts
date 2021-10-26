import {useMemo} from 'react';
import {expandCollapsedBlockBy} from '../utils';
import {HunkType} from '../interface';

const useMinCollapsedLines = (minLinesExclusive: number, hunks: HunkType[], oldSource?: string) => {
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
};

export default useMinCollapsedLines;
