import {createContext, ReactElement, ReactNode, useContext} from 'react';
import {ChangeData} from '../utils/parse';
import {TokenNode} from '../tokenize';

export type DefaultRenderToken = (token: TokenNode, index: number) => ReactNode;

export type RenderToken = (token: TokenNode, renderDefault: DefaultRenderToken, index: number) => ReactNode;

export interface GutterOptions {
    change: ChangeData;
    side: 'old' | 'new';
    inHoverState: boolean;
    renderDefault: () => ReactNode;
    wrapInAnchor: (element: ReactNode) => ReactNode;
}

export type RenderGutter = (options: GutterOptions) => ReactNode;

export interface HunkTokens {
    old: TokenNode[][];
    new: TokenNode[][];
}

export type ViewType = 'unified' | 'split';

export type GutterType = 'default' | 'none' | 'anchor';

export interface ContextProps {
    monotonous: boolean;
    gutterType: GutterType;
    viewType: ViewType;
    widgets: Record<string, ReactElement>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens;
    generateAnchorID: (change: ChangeData) => string | undefined;
    renderToken?: RenderToken;
    renderGutter: RenderGutter;
}

const DEFAULT_VALUE: ContextProps = {
    monotonous: false,
    gutterType: 'default',
    viewType: 'split',
    widgets: {},
    hideGutter: false,
    selectedChanges: [],
    generateAnchorID: () => undefined,
    renderGutter: ({renderDefault, wrapInAnchor}) => wrapInAnchor(renderDefault()),
};

const ContextType = createContext(DEFAULT_VALUE);

export const Provider = ContextType.Provider;

export const useDiffSettings = () => useContext(ContextType);
