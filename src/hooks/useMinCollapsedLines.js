import {useMemo} from 'react';
import {expandCollapsedBlockBy} from '../utils';

export default (minLinesExclusive, hunks, oldSource) => {
    if (!oldSource) {
        return hunks;
    }

    const renderingHunks = useMemo(
        () => {
            const predicate = lines => lines < minLinesExclusive;

            return expandCollapsedBlockBy(hunks, oldSource, predicate);
        },
        [minLinesExclusive, hunks, oldSource]
    );

    return renderingHunks;
};
