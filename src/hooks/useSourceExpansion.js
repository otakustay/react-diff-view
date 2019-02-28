import {useReducer, useEffect, useMemo} from 'react';
import {expandFromRawCode} from '../utils';

const useAppendableCollection = () => {
    const update = (collection, {type, value}) => {
        switch (type) {
            case 'clear':
                return collection.length ? [] : collection;
            case 'push':
                return [...collection, value];
            default:
                return collection;
        }
    };

    const [collection, dispatch] = useReducer(update, []);
    return {
        collection,
        clear() {
            dispatch({type: 'clear'});
        },
        push(value) {
            dispatch({value, type: 'push'});
        },
    };
};

export default (hunks, oldSource) => {
    const {collection: expandedRanges, clear, push} = useAppendableCollection();
    useEffect(clear, [hunks, oldSource]);
    const linesOfOldSource = useMemo(() => (oldSource || '').split('\n'), [oldSource]);
    const renderingHunks = useMemo(
        () => {
            if (!oldSource) {
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
