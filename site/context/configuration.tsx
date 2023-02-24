import {createContext, useState, useContext, useMemo, useCallback, ReactNode} from 'react';
import {MarkEditsType, ViewType} from 'react-diff-view';

export interface AppConfiguration {
    viewType: ViewType;
    editsType: MarkEditsType;
    showGutter: boolean;
    language: string;
}

export interface AppConfigurationContextValue {
    configuration: AppConfiguration;
    switchViewType: (value: ViewType) => void;
    changeLanguage: (value: string) => void;
    switchEditsType: (value: MarkEditsType) => void;
    switchGutterVisibility: (value: boolean) => void;
}

const DEFAULT_VALUE: AppConfigurationContextValue = {
    configuration: {
        viewType: 'split',
        editsType: 'block',
        showGutter: true,
        language: 'text',
    },
    switchViewType: () => {},
    changeLanguage: () => {},
    switchEditsType: () => {},
    switchGutterVisibility: () => {},
};

const Context = createContext(DEFAULT_VALUE);
Context.displayName = 'ConfigurationContext';

interface Props {
    children: ReactNode;
}

export function Provider({children}: Props) {
    const [configuration, update] = useState(DEFAULT_VALUE.configuration);
    const switchViewType = useCallback(
        (value: ViewType) => update(configuration => ({...configuration, viewType: value})),
        []
    );
    const changeLanguage = useCallback(
        (value: string) => update(configuration => ({...configuration, language: value})),
        []
    );
    const switchEditsType = useCallback(
        (value: MarkEditsType) => update(configuration => ({...configuration, editsType: value})),
        []
    );
    const switchGutterVisibility = useCallback(
        (value: boolean) => update(configuration => ({...configuration, showGutter: value})),
        []
    );
    const contextValue = useMemo(
        () => ({configuration, switchViewType, changeLanguage, switchEditsType, switchGutterVisibility}),
        [configuration, switchViewType, changeLanguage, switchEditsType, switchGutterVisibility]
    );
    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

function createContextHook<K extends keyof AppConfigurationContextValue>(name: K) {
    return (): AppConfigurationContextValue[K] => {
        const context = useContext(Context);
        return context[name];
    };
}

export const useConfiguration = createContextHook('configuration');
export const useSwitchViewType = createContextHook('switchViewType');
export const usechangeLanguage = createContextHook('changeLanguage');
export const useSwitchEditsType = createContextHook('switchEditsType');
export const useSwitchGutterVisibility = createContextHook('switchGutterVisibility');
