import {useEffect, useMemo} from 'react';
import {expandFromRawCode} from '../utils';
import {useCollection} from './helpers';

export default (hunks, oldSource) => {
    const {collection: expandedRanges, clear, push} = useCollection();
    useEffect(clear, [hunks, oldSource]);
    const linesOfOldSource = useMemo(() => (oldSource || '').split('\n'), [oldSource]);
    const renderingHunks = useMemo(
        () => {
            if (!linesOfOldSource.length) {
                return hunks;
            }

            return expandedRanges.reduce(
                (hunks, [start, end]) => expandFromRawCode(hunks, linesOfOldSource, start, end),
                hunks
            );
        },
        [linesOfOldSource, hunks, expandedRanges]
    );

    return [
        renderingHunks,
        (start, end) => push([start, end]),
    ];
};
