import {createContext, useContext} from 'react';

export interface ContextShape {
    monotonous: boolean;
    gutterType: 'default' | 'anchor' | 'none';
    viewType: 'unified' | 'split';
}

const DEFAULT_VALUE: ContextShape = {
    monotonous: false,
    gutterType: 'default',
    viewType: 'split',
};

const ContextType = createContext(DEFAULT_VALUE);

export const Provider = ContextType.Provider;

export const useDiffSettings = () => useContext(ContextType);
