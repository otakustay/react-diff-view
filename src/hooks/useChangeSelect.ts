import {Hunk} from 'gitdiff-parser';
import {useEffect} from 'react';
import {ChangeEventArgs} from '../Hunk';
import {getChangeKey} from '../utils';
import {useCollection} from './helpers';

export interface UseChangeSelectOptions {
    multiple?: boolean;
}

export default function useChangeSelect(hunks: Hunk[], {multiple = false}: UseChangeSelectOptions = {}) {
    const {collection, clear, toggle, only} = useCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(clear, [hunks]);

    return [
        collection,
        ({change}: ChangeEventArgs) => {
            if (!change) {
                return;
            }

            const changeKey = getChangeKey(change);
            if (multiple) {
                toggle(changeKey);
            }
            else {
                only(changeKey);
            }
        },
    ];
}
