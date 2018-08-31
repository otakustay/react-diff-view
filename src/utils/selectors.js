import {mapValues} from 'lodash';
import shallowEquals from 'shallow-equal/objects';

// Simplified version of reselect
const createSelector = (select, inputEquals) => {
    let lastInput = null;
    let lastResult = null;

    return (...input) => {
        if (!lastInput || !inputEquals(lastInput, input)) {
            lastResult = select(...input);
            lastInput = input;
        }

        return lastResult;
    };
};

export const createEventsBindingSelector = () => createSelector(
    // Bind args of all event callbacks to given input
    (events, arg) => mapValues(events, fn => () => fn(arg)),
    // [events, {change, side}]
    (prev, next) => shallowEquals(prev[0], next[0]) && shallowEquals(prev[1], next[1])
);
