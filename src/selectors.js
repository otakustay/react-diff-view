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

const destructChunkEvents = (customEvents = {}) => {
    const {
        gutterHeader: headerGutterEvents,
        codeHeader: headerContentEvents,
        ...otherEvents
    } = customEvents;

    return {headerGutterEvents, headerContentEvents, otherEvents};
};

export const createChunkEventsSelector = () => createSelector(destructChunkEvents);

const destructChunkClassNames = (customClassNames = {}) => {
    const {
        chunk: chunkClassName,
        chunkHeader: headerClassName,
        gutterHeader: headerGutterClassName,
        codeHeader: headerContentClassName,
        ...otherClassNames
    } = customClassNames;

    return {chunkClassName, headerClassName, headerGutterClassName, headerContentClassName, otherClassNames};
};

export const createChunkClassNamesSelector = () => createSelector(destructChunkClassNames);

const bindAllEvents = (events, arg) => mapValues(events, fn => () => fn(arg));

export const createEventsBindingSelector = () => createSelector(bindAllEvents);
