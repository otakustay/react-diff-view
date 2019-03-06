import {useReducer, useRef} from 'react';

const updateCollection = (collection, {type, value}) => {
    switch (type) {
        case 'push':
            return [...collection, value];
        case 'clear':
            return collection.length ? [] : collection;
        case 'toggle':
            return collection.includes(value)
                ? collection.filter(item => item !== value)
                : collection.concat(value);
        case 'only':
            return [value];
        default:
            return collection;
    }
};

export const useCollection = () => {
    const [collection, dispatch] = useReducer(updateCollection, []);

    return {
        collection,
        clear() {
            dispatch({type: 'clear'});
        },
        push(value) {
            dispatch({value, type: 'push'});
        },
        toggle(value) {
            dispatch({value, type: 'toggle'});
        },
        only(value) {
            dispatch({value, type: 'only'});
        },
    };
};

// This is actually a hack around the lack of custom comparator support in `useEffect` hook.
export const useCustomEqualIdentifier = (value, equals) => {
    const cache = useRef({});
    const identifier = useRef(0);
    const isEqual = equals(value, cache.current);

    if (!isEqual) {
        cache.current = value;
        identifier.current = identifier.current + 1;
    }

    return identifier.current;
};
