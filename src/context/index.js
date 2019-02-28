import {createContext, useContext} from 'react';

const ContextType = createContext();
const {Provider} = ContextType;
const useDiffSettings = () => useContext(ContextType);

export {
    Provider,
    useDiffSettings,
};
