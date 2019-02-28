import {useReducer, useEffect} from 'react';
import {getChangeKey} from '../utils';

const useCollection = multiple => {
    const update = (collection, {type, value}) => {
        switch (type) {
            case 'clear':
                return collection.length ? [] : collection;
            case 'toggle': {
                if (multiple) {
                    return collection.includes(value)
                        ? collection.filter(item => item !== value)
                        : collection.concat(value);
                }

                return [value];
            }
            default:
                return collection;
        }
    };

    const [collection, dispatch] = useReducer(update, []);
    return {
        collection,
        clear() {
            dispatch({type: 'clear'});
        },
        toggle(value) {
            dispatch({value, type: 'toggle'});
        },
    };
};

export default (hunks, {multiple = false} = {}) => {
    const {collection, clear, toggle} = useCollection(multiple);
    useEffect(clear, [hunks]);

    return [
        collection,
        ({change}) => toggle(getChangeKey(change)),
    ];
};
