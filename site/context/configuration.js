import {createContext, useState, useContext, useMemo, useCallback} from 'react';

const INITIAL_CONFIGURATION = {
    viewType: 'split',
    editsType: 'block',
    showGutter: true,
    language: 'text',
};

const Context = createContext(null);
Context.displayName = 'ConfigurationContext';

export const Provider = props => {
    const [configuration, update] = useState(INITIAL_CONFIGURATION);
    const switchViewType = useCallback(value => update({...configuration, viewType: value}), [configuration]);
    const changeLanguage = useCallback(value => update({...configuration, language: value}), [configuration]);
    const switchEditsType = useCallback(value => update({...configuration, editsType: value}), [configuration]);
    const switchGutterVisibility = useCallback(value => update({...configuration, showGutter: value}), [configuration]);
    const contextValue = useMemo(
        () => ({configuration, switchViewType, changeLanguage, switchEditsType, switchGutterVisibility}),
        [configuration, switchViewType, changeLanguage, switchEditsType, switchGutterVisibility]
    );
    return <Context.Provider value={contextValue} {...props} />;
};

const createContextHook = name => () => {
    const context = useContext(Context);
    return context[name];
};

export const useConfiguration = createContextHook('configuration');
export const useSwitchViewType = createContextHook('switchViewType');
export const usechangeLanguage = createContextHook('changeLanguage');
export const useSwitchEditsType = createContextHook('switchEditsType');
export const useSwitchGutterVisibility = createContextHook('switchGutterVisibility');
