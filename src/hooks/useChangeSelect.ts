import {useEffect} from 'react';
import {getChangeKey} from '../utils';
import {Change, HunkType} from '../interface';
import {useCollection} from './helpers';

const useChangeSelect = (hunks: HunkType[], {multiple = false} = {}) => {
    const {collection, clear, toggle, only} = useCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(clear, [hunks]);

    return [
        collection,
        ({change}: {change: Change}) => {
            const changeKey = getChangeKey(change);
            if (multiple) {
                toggle(changeKey);
            }
            else {
                only(changeKey);
            }
        },
    ];
};

export default useChangeSelect;
