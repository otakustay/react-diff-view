import mapValues from 'lodash.mapvalues';

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

const destructHunkEvents = (customEvents = {}) => {
    const {
        gutterHeader: headerGutterEvents,
        codeHeader: headerContentEvents,
        ...otherEvents
    } = customEvents;

    return {headerGutterEvents, headerContentEvents, otherEvents};
};

export const createHunkEventsSelector = () => createSelector(destructHunkEvents);

const destructHunkClassNames = (customClassNames = {}) => {
    const {
        hunk: hunkClassName,
        hunkHeader: headerClassName,
        gutterHeader: headerGutterClassName,
        codeHeader: headerContentClassName,
        ...otherClassNames
    } = customClassNames;

    return {hunkClassName, headerClassName, headerGutterClassName, headerContentClassName, otherClassNames};
};

export const createHunkClassNamesSelector = () => createSelector(destructHunkClassNames);

const bindAllEvents = (events, arg) => mapValues(events, fn => () => fn(arg));

export const createEventsBindingSelector = () => createSelector(bindAllEvents);
