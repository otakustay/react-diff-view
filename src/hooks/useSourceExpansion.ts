import {useEffect, useMemo} from 'react';
import {expandFromRawCode} from '../utils';
import {HunkType} from '../interface';
import {useCollection} from './helpers';

const useSourceExpansion = (hunks: HunkType[], oldSource?: string) => {
    const {collection: expandedRanges, clear, push} = useCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(clear, [hunks, oldSource]);
    const linesOfOldSource = useMemo(
        () => (oldSource || '').split('\n'),
        [oldSource]
    );
    const renderingHunks = useMemo(
        () => {
            if (!linesOfOldSource.length) {
                return hunks;
            }

            return expandedRanges.reduce(
                (hunks: HunkType[], [start, end]: [number, number]) => {
                    return expandFromRawCode(hunks, linesOfOldSource, start, end);
                },
                hunks
            );
        },
        [linesOfOldSource, hunks, expandedRanges]
    );

    return [
        renderingHunks,
        (start: number, end: number) => push([start, end]),
    ];
};

export default useSourceExpansion;
