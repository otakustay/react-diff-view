import {mapValues} from 'lodash';

const inputEquals = (prev, current) => {
    if (prev.length !== current.length) {
        return false;
    }

    for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== current[i]) {
            return false;
        }
    }

    return true;
};

// Simplified version of reselect
const createSelector = select => {
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

const bindAllEvents = (events, arg) => mapValues(events, fn => () => fn(arg));

export const createEventsBindingSelector = () => createSelector(bindAllEvents);
