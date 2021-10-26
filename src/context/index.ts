import {createContext, useContext} from 'react';

interface Context {
    gutterType: 'default' | 'none' | 'anchor';
    viewType: 'unified' | 'split';
    selectedChanges: string[];
    monotonous: boolean;
    widgets: {
        [key: string]: any;
    };
    renderGutter: () => any;
    generateAnchorID: () => any;
}

// TODO add default Context
const ContextType = createContext<Context>(undefined as unknown as Context);
const {Provider} = ContextType;
const useDiffSettings = () => useContext(ContextType);

export {
    Provider,
    useDiffSettings,
};
