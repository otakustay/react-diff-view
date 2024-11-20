import {createContext, DOMAttributes, ReactNode, useContext} from 'react';
import {ChangeData} from '../utils/parse';
import {HunkTokens, TokenNode} from '../tokenize';
import {Side} from '../interface';

export type DefaultRenderToken = (token: TokenNode, index: number) => ReactNode;

export type RenderToken = (token: TokenNode, renderDefault: DefaultRenderToken, index: number) => ReactNode;

export interface GutterOptions {
    change: ChangeData;
    side: Side;
    inHoverState: boolean;
    renderDefault: () => ReactNode;
    wrapInAnchor: (element: ReactNode) => ReactNode;
}

export type RenderGutter = (options: GutterOptions) => ReactNode;

export type ViewType = 'unified' | 'split';

export type GutterType = 'default' | 'none' | 'anchor';

type IsEvent<T> = T extends `on${string}` ? T : never;

export type EventKeys = IsEvent<keyof DOMAttributes<HTMLElement>>;

export type NativeEventMap = Partial<{[K in EventKeys]: DOMAttributes<HTMLElement>[K]}>;

type ExtractEventHandler<E extends EventKeys> = Exclude<NativeEventMap[E], undefined>;

type ExtractEventType<E extends EventKeys> = Parameters<ExtractEventHandler<E>>[0];

export interface ChangeEventArgs {
    // TODO: use union type on next major version
    side?: Side;
    change: ChangeData | null;
}

type BindEvent<E extends EventKeys> = (args: ChangeEventArgs, event: ExtractEventType<E>) => void;

export type EventMap = Partial<{[K in EventKeys]: BindEvent<K>}>;

export interface ContextProps {
    hunkClassName: string;
    lineClassName: string;
    gutterClassName: string;
    codeClassName: string;
    monotonous: boolean;
    gutterType: GutterType;
    viewType: ViewType;
    widgets: Record<string, ReactNode>;
    hideGutter: boolean;
    selectedChanges: string[];
    tokens?: HunkTokens | null;
    generateAnchorID: (change: ChangeData) => string | undefined;
    generateLineClassName: (params: {changes: ChangeData[], defaultGenerate: () => string}) => string | undefined;
    renderToken?: RenderToken;
    renderGutter: RenderGutter;
    gutterEvents: EventMap;
    codeEvents: EventMap;
}

export const DEFAULT_CONTEXT_VALUE: ContextProps = {
    hunkClassName: '',
    lineClassName: '',
    gutterClassName: '',
    codeClassName: '',
    monotonous: false,
    gutterType: 'default',
    viewType: 'split',
    widgets: {},
    hideGutter: false,
    selectedChanges: [],
    generateAnchorID: () => undefined,
    generateLineClassName: () => undefined,
    renderGutter: ({renderDefault, wrapInAnchor}) => wrapInAnchor(renderDefault()),
    codeEvents: {},
    gutterEvents: {},
};

const ContextType = createContext(DEFAULT_CONTEXT_VALUE);

export const Provider = ContextType.Provider;

export const useDiffSettings = () => useContext(ContextType);
