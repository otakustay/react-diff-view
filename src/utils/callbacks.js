import arrayShallowEquals from 'shallow-equal/arrays';

// TODO: Delete it after all class components are converted to hooks based.
export const createSelector = (select, inputEquals = arrayShallowEquals) => {
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
