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

const composeCallback = (customCallback, ownCallback) => e => {
    ownCallback(e);
    customCallback(); // `customCallback` is already bound with `arg`
};

export const createEventsBindingSelector = ownEvents => {
    const ownEventEntries = Object.entries(ownEvents);

    return createSelector(
        // Bind args of all event callbacks to given input
        (events, arg) => {
            const customEvents = mapValues(events, fn => () => fn(arg));
            return ownEventEntries.reduce(
                (events, [name, ownCallback]) => {
                    const customCallback = events[name];
                    const callback = customCallback ? composeCallback(customCallback, ownCallback) : ownCallback;

                    return {
                        ...events,
                        [name]: callback
                    };
                },
                customEvents
            );
        },
        // [events, {change, side}]
        (prev, next) => shallowEquals(prev[0], next[0]) && shallowEquals(prev[1], next[1])
    );
};
