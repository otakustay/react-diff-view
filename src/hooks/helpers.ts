import {Reducer, useReducer, useRef} from 'react';

interface ClearCommand {
    type: 'clear';
}

interface ModifyCommand<T> {
    type: 'push' | 'toggle' | 'only';
    value: T;
}

type UpdateCommand<T> = ClearCommand | ModifyCommand<T>;

function updateCollection<T>(collection: T[], command: UpdateCommand<T>) {
    switch (command.type) {
        case 'push':
            return [...collection, command.value];
        case 'clear':
            return collection.length ? [] : collection;
        case 'toggle':
            return collection.includes(command.value)
                ? collection.filter(item => item !== command.value)
                : collection.concat(command.value);
        case 'only':
            return [command.value];
        default:
            return collection;
    }
}

export function useCollection<T>() {
    const [collection, dispatch] = useReducer<Reducer<T[], UpdateCommand<T>>>(updateCollection, []);

    return {
        collection,
        clear() {
            dispatch({type: 'clear'});
        },
        push(value: T) {
            dispatch({value, type: 'push'});
        },
        toggle(value: T) {
            dispatch({value, type: 'toggle'});
        },
        only(value: T) {
            dispatch({value, type: 'only'});
        },
    };
}

// This is actually a hack around the lack of custom comparator support in `useEffect` hook.
export function useCustomEqualIdentifier<T>(value: T, equals: (x: T, y: T | undefined) => boolean) {
    const cache = useRef<T | undefined>(undefined);
    const identifier = useRef(0);
    const isEqual = equals(value, cache.current);

    // TODO: this is not cocurrency safe
    if (!isEqual) {
        cache.current = value;
        identifier.current = identifier.current + 1;
    }

    return identifier.current;
}
