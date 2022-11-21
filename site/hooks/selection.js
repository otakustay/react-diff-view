import {useCallback, useMemo, useState} from 'react';
import {getChangeKey} from 'react-diff-view';

export const useSelection = hunks => {
    const [{start, end}, setSelection] = useState({start: null, end: null});
    const [currentHunks, setCurrentHunks] = useState(hunks);
    const select = useCallback(
        ({change}, e) => {
            const key = getChangeKey(change);
            if (e.shiftKey && start) {
                setSelection(v => ({start: v.start, end: key}));
            }
            else {
                setSelection({start: key, end: key});
            }
        },
        [start]
    );
    const selected = useMemo(
        () => {
            if (!start || !end) {
                return [];
            }

            if (start === end) {
                return [start];
            }

            // Find all changes from start to end in all hunks
            const state = {
                inSelection: false,
                keys: [],
            };
            for (const hunk of currentHunks) {
                for (const change of hunk.changes) {
                    const key = getChangeKey(change);
                    if (key === start || key === end) {
                        state.keys.push(key);
                        state.inSelection = !state.inSelection;
                    }
                    else if (state.inSelection) {
                        state.keys.push(key);
                    }
                }
            }
            return state.keys;
        },
        [currentHunks, end, start]
    );

    if (hunks !== currentHunks) {
        setSelection({start: null, end: null});
        setCurrentHunks(hunks);
    }

    return [selected, select];
};
