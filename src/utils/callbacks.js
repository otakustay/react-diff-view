import {mapValues} from 'lodash';
import arrayShallowEquals from 'shallow-equal/arrays';

const composeCallback = (customCallback, ownCallback) => e => {
    ownCallback(e);
    customCallback(); // `customCallback` is already bound with `arg`
};

export const mergeCallbacks = (own, custom, arg) => {
    const boundCustomCallbacks = mapValues(custom, fn => () => fn(arg));

    return Object.entries(own).reduce(
        (callbacks, [name, ownCallback]) => {
            const customCallback = callbacks[name];
            const callback = customCallback ? composeCallback(customCallback, ownCallback) : ownCallback;

            return {
                ...callbacks,
                [name]: callback,
            };
        },
        boundCustomCallbacks
    );
};

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
