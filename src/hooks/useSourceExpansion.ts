import {useEffect, useMemo} from 'react';
import {expandFromRawCode, HunkData, Source} from '../utils';
import {useCollection} from './helpers';

export default function useSourceExpansion(hunks: HunkData[], oldSource: Source | null) {
    const {collection: expandedRanges, clear, push} = useCollection<[number, number]>();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(clear, [hunks, oldSource]);
    const linesOfOldSource = useMemo(
        () => (Array.isArray(oldSource) ? oldSource : (oldSource || '').split('\n')),
        [oldSource]
    );
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
        (start: number, end: number) => push([start, end]),
    ] as const;
}
